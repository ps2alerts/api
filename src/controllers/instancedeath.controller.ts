import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import Death from "../reports/instance/death.entity";
import {InjectEntityManager, InjectRepository} from "@nestjs/typeorm";
import {MongoEntityManager, MongoRepository} from "typeorm";

interface InstanceMetagameMessageData {
    instanceId: string;
    type: string
}

@Controller()
export default class InstanceDeathController {
    private em: MongoEntityManager;

    constructor(
        @InjectEntityManager() em: MongoEntityManager
    ) {
        this.em = em
    }

    // CREATE

    public async create(): Promise<void> {
        // Instantiate model
        const death = new Death();
        death.instance = "10-TEST";
        death.attacker = "12345678wegsdghshsrhf9";

        await this.em.insert(Death, death)
    }

    // MQHANDLE
    @MessagePattern('instanceDeath')
    public handleMessage(@Payload() data: InstanceMetagameMessageData): void {
        console.log('instanceDeath', data);

        void this.create()
        // If starting

    }
}