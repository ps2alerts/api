import {Controller} from '@nestjs/common';
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

    // CREATE

    public async create(): Promise<void> {
        // Instantiate model
        const death = new Death();
        death.instance = '10-TEST';
        death.attacker = '12345678wegsdghshsrhf9';

        await this.em.insert(Death, death);
    }

    // MQHANDLE
    @MessagePattern('instanceDeath')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public handleMessage(@Payload() data: InstanceMetagameMessageData): void {
        // TODO: VALIDATE THE DATA FROM MQ

        void this.create();
        // If starting

    }
}
