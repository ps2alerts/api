import {Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/aggregator.message.interface';
import InstanceFacilityControlAggregateEntity from '../../../../data/entities/aggregate/instance/instance.facility.control.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@Controller()
export default class AggregatorInstanceFacilityControlAggregateController {
    constructor(private readonly mongoOperationsService: MongoOperationsService) {}

    @EventPattern(MQAcceptedPatterns.INSTANCE_FACILITY_CONTROL_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        await this.mongoOperationsService.update(data, context, InstanceFacilityControlAggregateEntity);
    }
}
