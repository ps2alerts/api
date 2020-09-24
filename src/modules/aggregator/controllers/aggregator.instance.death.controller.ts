/* eslint-disable @typescript-eslint/no-explicit-any */
import {BadRequestException, Controller} from '@nestjs/common';
import {MessagePattern, Payload} from '@nestjs/microservices';
import Death from '../../data/entities/instance/death.entity';
import {InjectEntityManager} from '@nestjs/typeorm';
import {MongoEntityManager} from 'typeorm';

interface InstanceMetagameMessageData {
    instanceId: string;
    type: string;
}

@Controller()
export default class AggregatorInstanceDeathController {
    private readonly em: MongoEntityManager;

    constructor(
    @InjectEntityManager() em: MongoEntityManager,
    ) {
        this.em = em;
    }

    @MessagePattern('instanceDeath.create')
    public async create(@Payload() docs: any[]): Promise<void> {
        for (const doc of docs) {
            console.log('Inserting death: ', doc);

            try {
                await this.em.insert(Death, doc);
            } catch (e) {
                throw new BadRequestException('Unable to create document', 'instanceDeath aggregate');
            }
        }
    }
}
