/* eslint-disable @typescript-eslint/no-explicit-any */
import {BadRequestException, Controller} from '@nestjs/common';
import {Ctx, MessagePattern, Payload, RmqContext} from '@nestjs/microservices';
import InstanceDeath from '../../../data/entities/instance/instance.death.entity';
import {InjectEntityManager} from '@nestjs/typeorm';
import {MongoEntityManager} from 'typeorm';

@Controller()
export default class AggregatorInstanceDeathEventController {
    private readonly em: MongoEntityManager;

    constructor(@InjectEntityManager() em: MongoEntityManager) {
        this.em = em;
    }

    @MessagePattern('instanceDeathEvent.create')
    public async create(@Payload() docs: any[], @Ctx() context: RmqContext): Promise<void> {
        for (const doc of docs) {
            try {
                await this.em.insert(InstanceDeath, doc);
            } catch (e) {
                throw new BadRequestException('Unable to create document!', 'instanceDeathEvent.create');
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        context.getChannelRef().ack(context.getMessage());
    }
}
