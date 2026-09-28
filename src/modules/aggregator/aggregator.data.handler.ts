/* eslint-disable @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any */
import AggregatorMessageInterface from '../../modules/aggregator/interfaces/aggregator.message.interface';
import {RmqContext} from '@nestjs/microservices';
import {Inject, Injectable, Logger} from '@nestjs/common';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import {UpsertError} from '../../services/mongo/upsert.error';
import GlobalAggregatorMessageInterface from './interfaces/global.aggregator.message.interface';
import InstanceMetagameTerritoryEntity from '../data/entities/instance/instance.metagame.territory.entity';
import {Ps2AlertsEventState} from '../data/ps2alerts-constants/ps2AlertsEventState';
import {Bracket} from '../data/ps2alerts-constants/bracket';

@Injectable()
export default class AggregatorDataHandler {
    private readonly logger = new Logger(AggregatorDataHandler.name);

    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    public async create(data: AggregatorMessageInterface, context: RmqContext, entity: any): Promise<void> {
        try {
            await this.mongoOperationsService.insertMany(
                entity,
                data.docs,
            );
        } catch (err) {
            // Every collection written here has a unique index, so a replayed insert cannot duplicate rows
            this.retryOnce(context, `Unable to create data for Aggregation! E: ${err instanceof Error ? err.message : String(err)}`);
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        context.getChannelRef().ack(context.getMessage());
    }

    public async upsert(data: AggregatorMessageInterface, context: RmqContext, entity: any): Promise<void> {
        try {
            await this.mongoOperationsService.upsert(
                entity,
                data.docs,
                data.conditionals,
            );
        } catch (err) {
            this.settleFailedUpsert(context, err, 'Unable to upsert data for Aggregation!');
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        context.getChannelRef().ack(context.getMessage());
    }

    public async upsertGlobal(data: GlobalAggregatorMessageInterface, context: RmqContext, entity: any): Promise<void> {
        // If there is no bracket available now, reject the message as it shouldn't be possible.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (data.conditionals[0] && data.conditionals[0].bracket === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            await context.getChannelRef().reject(context.getMessage());

            this.logger.error(`Attempted to add GlobalAggregator without a bracket for instance ${data.instance}`);
            return;
        }

        try {
            await this.mongoOperationsService.upsert(
                entity,
                data.docs,
                data.conditionals,
            );
        } catch (err) {
            this.settleFailedUpsert(context, err, `Unable to upsert data for Global Aggregation of instance ${data.instance}!`);
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        await context.getChannelRef().ack(context.getMessage());
    }

    public async transformGlobal(data: GlobalAggregatorMessageInterface): Promise<GlobalAggregatorMessageInterface> {
        const newConditionals: any[] = [];

        for (let conditional of data.conditionals) {
            // Format for any dates
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            conditional = this.transformDateConditional(conditional);

            let bracket: Bracket;

            // If total bracket was not supplied, we are going to pull in the instance and get it's bracket
            if (data.bracket === Bracket.TOTAL) {
                bracket = Bracket.TOTAL;
            } else {
                let instance: InstanceMetagameTerritoryEntity;

                try {
                    // If none is found an exception will throw (fineOneOrFail)
                    instance = await this.mongoOperationsService.findOne(
                        InstanceMetagameTerritoryEntity,
                        {instanceId: data.instance},
                    );
                } catch (e) {
                    if (e instanceof Error && e.name === 'EntityNotFoundError') {
                        throw new Error(`Instance ${data.instance} does not exist.`);
                    }

                    throw e;
                }

                if (instance.state === Ps2AlertsEventState.ENDED) {
                    bracket = instance.bracket;
                } else {
                    throw new Error(`Received Global Aggregate message for unfinished instance ${data.instance}`);
                }
            }

            newConditionals.push(Object.assign(conditional, {bracket}));
        }

        // Reassign the conditionals to the newly generated conditions
        data.conditionals = newConditionals;

        return data;
    }

    // Called by global controllers when the message failed before anything was written
    public async settleGlobalFailure(context: RmqContext, err: unknown, pattern: string, instance: string): Promise<void> {
        const reason = err instanceof Error ? err.message : String(err);

        // A deleted alert, or a bracket message for an alert not yet ended, cannot succeed on a retry
        if (reason.includes('does not exist') || reason.includes('unfinished instance')) {
            if (!reason.includes('does not exist')) {
                this.logger.error(`Unable to process ${pattern} message for instance ${instance}! Error: ${reason}`);
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            await context.getChannelRef().ack(context.getMessage());
            return;
        }

        this.retryOnce(context, `Unable to process ${pattern} message for instance ${instance}! Error: ${reason}`);
    }

    private transformDateConditional(conditional: any): any {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (conditional.date) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return Object.assign(conditional, {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
                date: new Date(conditional.date),
            });
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return conditional;
    }

    // A replay after a partial write would count its increments twice, so only a write that provably did nothing is retried
    private settleFailedUpsert(context: RmqContext, err: unknown, reason: string): void {
        const message = `${reason} E: ${err instanceof Error ? err.message : String(err)}`;

        if (err instanceof UpsertError && err.nothingWritten) {
            this.retryOnce(context, message);
            return;
        }

        this.logger.error(`${message}. Part of it may have been written, so it is not retried.`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        context.getChannelRef().ack(context.getMessage());
    }

    // A failed write is requeued once, since most failures are a Mongo blip; a second failure is logged and dropped
    private retryOnce(context: RmqContext, reason: string): void {
        const message = context.getMessage();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const channel = context.getChannelRef();

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (!message.fields.redelivered) {
            this.logger.warn(`${reason}. Requeueing once.`);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            channel.nack(message, false, true);
            return;
        }

        this.logger.error(`${reason}. Failed on redelivery too, dropping the message.`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        channel.ack(message);
    }
}
