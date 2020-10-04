import {Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import InstanceDeathEntity from '../../../data/entities/instance/instance.death.entity';
import AggregatorMessageInterface from '../../interfaces/aggregator.message.interface';
import {MQAcceptedPatterns} from '../../../data/constants/MQAcceptedPatterns';
import MongoOperationsService from '../../../../services/mongo/mongo.operations.service';

@Controller()
export default class AggregatorInstanceDeathEventController {
    constructor(private readonly mongoOperationsService: MongoOperationsService) {}

    @EventPattern(MQAcceptedPatterns.INSTANCE_DEATH)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        await this.mongoOperationsService.create(data, context, InstanceDeathEntity);
    }
}
