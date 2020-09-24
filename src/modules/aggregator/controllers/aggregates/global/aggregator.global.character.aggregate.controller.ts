/* eslint-disable @typescript-eslint/no-explicit-any */
import {BadRequestException, Controller} from '@nestjs/common';
import {Ctx, MessagePattern, Payload, RmqContext} from '@nestjs/microservices';
import {InjectEntityManager} from '@nestjs/typeorm';
import {MongoEntityManager} from 'typeorm';
import GlobalCharacterAggregate from '../../../../data/entities/aggregate/global/character.entity';
import AggregatorMessageInterface from '../../../interfaces/AggregatorMessageInterface';

@Controller()
export default class AggregatorGlobalCharacterAggregateController {
    private readonly em: MongoEntityManager;

    constructor(@InjectEntityManager() em: MongoEntityManager) {
        this.em = em;
    }

    @MessagePattern('globalCharacterAggregate.create')
    public async create(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        for (const doc of data.docs) {
            try {
                await this.em.updateOne(
                    GlobalCharacterAggregate,
                    data.conditionals[0],
                    doc,
                    {upsert: true});
            } catch (e) {
                throw new BadRequestException('Unable to create document!', 'globalCharacterAggregate.create');
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        context.getChannelRef().ack(context.getMessage());
    }
}
