/* eslint-disable @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any */
import {MongoEntityManager} from 'typeorm';
import {RmqContext} from '@nestjs/microservices';
import AggregatorMessageInterface from '../interfaces/AggregatorMessageInterface';
import {InjectEntityManager} from '@nestjs/typeorm';

export default abstract class AggregatorBaseController {
    protected readonly em: MongoEntityManager;

    constructor(@InjectEntityManager() em: MongoEntityManager) {
        this.em = em;
    }

    public async create(data: AggregatorMessageInterface, context: RmqContext, entity: any): Promise<void> {
        const promises = [];

        for (const doc of data.docs) {
            promises.push(this.em.create(
                entity,
                doc,
            ));
        }

        await Promise.all(promises);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        context.getChannelRef().ack(context.getMessage());
    }

    public async update(data: AggregatorMessageInterface, context: RmqContext, entity: any): Promise<void> {
        const promises = [];

        for (const doc of data.docs) {
            promises.push(this.em.updateOne(
                entity,
                data.conditionals[0],
                doc,
                {upsert: true},
            ));
        }

        console.log(`Update promise length: ${promises.length}`);

        await Promise.all(promises);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        context.getChannelRef().ack(context.getMessage());
    }
}
