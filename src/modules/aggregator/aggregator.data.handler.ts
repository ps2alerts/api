/* eslint-disable @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any */
import AggregatorMessageInterface from '../../modules/aggregator/interfaces/aggregator.message.interface';
import {RmqContext} from '@nestjs/microservices';
import {Inject, Injectable, Logger} from '@nestjs/common';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import GlobalAggregatorMessageInterface from './interfaces/global.aggregator.message.interface';
import InstanceMetagameTerritoryEntity from '../data/entities/instance/instance.metagame.territory.entity';
import {Ps2alertsEventState} from '../data/constants/eventstate.consts';

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
            const error: Error = err;

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
            const error: Error = err;

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
        if (data.conditionals[0].bracket === undefined) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            await context.getChannelRef().ack(context.getMessage());

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
            const error: Error = err;

            if (!error.message.includes('E11000')) {
                this.logger.error(`Unable to upsert data for Global Aggregation! E: ${error.message}`);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        context.getChannelRef().ack(context.getMessage());
    }

    public async transformGlobal(data: GlobalAggregatorMessageInterface): Promise<GlobalAggregatorMessageInterface> {
        try {
            const instance: InstanceMetagameTerritoryEntity = await this.mongoOperationsService.findOne(
                InstanceMetagameTerritoryEntity,
                {instanceId: data.instance},
            );

            // Pull out conditionals and apply bracket to them
            if (instance.state === Ps2alertsEventState.ENDED) {
                const newConditionals: any[] = [];

                data.conditionals.forEach((conditional) => {
                    newConditionals.push(Object.assign(conditional, {
                        bracket: instance.bracket,
                    }));
                });

                data.conditionals = newConditionals;
            } else {
                this.logger.error(`Received Global Aggregate message for unfinished instance ${data.instance}`);
                // eslint-disable-next-line no-console
                console.log(data);
            }

            return data;
        } catch (error) {
            this.logger.error(`Unable to get instance ${data.instance} from the database and unable to transform`);
            return data;
        }
    }
}
