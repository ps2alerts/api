/* eslint-disable @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any */
import AggregatorMessageInterface from '../../modules/aggregator/interfaces/aggregator.message.interface';
import {RmqContext} from '@nestjs/microservices';
import {Inject, Injectable, Logger} from '@nestjs/common';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import GlobalAggregatorMessageInterface from './interfaces/global.aggregator.message.interface';
import InstanceMetagameTerritoryEntity from '../data/entities/instance/instance.metagame.territory.entity';
import {Ps2alertsEventState} from '../data/ps2alerts-constants/ps2alertsEventState';
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const error: Error = err as Error;

            if (!error.message.includes('E11000')) {
                this.logger.error(`Unable to create data for Aggregation! E: ${error.message}`);
            }
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const error: Error = err as Error;

            if (!error.message.includes('E11000')) {
                this.logger.error(`Unable to upsert data for Aggregation! E: ${error.message}`);
            }
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const error: Error = err as Error;

            if (!error.message.includes('E11000')) {
                throw new Error(`Unable to upsert data for Global Aggregation! E: ${error.message}`);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        await context.getChannelRef().ack(context.getMessage());
    }

    public async transformGlobal(data: GlobalAggregatorMessageInterface): Promise<GlobalAggregatorMessageInterface> {
        const newConditionals: any[] = [];

        // If bracket has been supplied intentionally (such as the "Total" bracket (0)) then add it in now
        if (data.bracket === Bracket.TOTAL) {
            data.conditionals.forEach((conditional) => {
                // Format for any dates
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                conditional = this.transformDateConditional(conditional);

                newConditionals.push(Object.assign(conditional, {
                    bracket: Bracket.TOTAL,
                }));
            });
        } else {
            let instance: InstanceMetagameTerritoryEntity;

            try {
                // If none is found an exception will throw (fineOneOrFail)
                instance = await this.mongoOperationsService.findOne(
                    InstanceMetagameTerritoryEntity,
                    {instanceId: data.instance},
                );
            } catch (e) {
                throw new Error(`Instance ${data.instance} does not exist.`);
            }

            // Pull out conditionals and apply bracket to them
            if (instance.state === Ps2alertsEventState.ENDED) {
                data.conditionals.forEach((conditional) => {
                    // Format for any dates
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    conditional = this.transformDateConditional(conditional);
                    newConditionals.push(Object.assign(conditional, {
                        bracket: instance.bracket,
                    }));
                });
            } else {
                this.logger.error(`Received Global Aggregate message for unfinished instance ${data.instance}`);
            }
        }

        data.conditionals = newConditionals;

        return data;
    }

    private transformDateConditional(conditional: any): any {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (conditional.date) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return Object.assign(conditional, {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                date: new Date(conditional.date),
            });
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return conditional;
    }
}
