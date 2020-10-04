import {Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import AggregatorMessageInterface from '../../interfaces/aggregator.message.interface';
import {MQAcceptedPatterns} from '../../../data/constants/MQAcceptedPatterns';
import InstanceFacilityControlEntity from '../../../data/entities/instance/instance.facilitycontrol.entity';
import MongoOperationsService from '../../../../services/mongo/mongo.operations.service';

@Controller()
export default class AggregatorInstanceFacilityControlEventController {
    constructor(private readonly mongoOperationsService: MongoOperationsService) {}

    @EventPattern(MQAcceptedPatterns.INSTANCE_FACILITY_CONTROL)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        console.log(data);
        await this.mongoOperationsService.create(data, context, InstanceFacilityControlEntity);
    }
}
