/* eslint-disable @typescript-eslint/no-explicit-any */
import {BadRequestException, Controller} from '@nestjs/common';
import {Ctx, MessagePattern, Payload, RmqContext} from '@nestjs/microservices';
import {InjectEntityManager} from '@nestjs/typeorm';
import {MongoEntityManager} from 'typeorm';
import InstanceFacilityControl from '../../../data/entities/instance/instance.facilitycontrol.entity';

@Controller()
export default class AggregatorInstanceFacilityControlEventController {
    private readonly em: MongoEntityManager;

    constructor(@InjectEntityManager() em: MongoEntityManager) {
        this.em = em;
    }

    @MessagePattern('instanceFacilityControlEvent.create')
    public async create(@Payload() docs: any[], @Ctx() context: RmqContext): Promise<void> {
        for (const doc of docs) {
            try {
                await this.em.insert(InstanceFacilityControl, doc);
            } catch (e) {
                throw new BadRequestException('Unable to create document!', 'instanceFacilityControlEvent.create');
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        context.getChannelRef().ack(context.getMessage());
    }
}
