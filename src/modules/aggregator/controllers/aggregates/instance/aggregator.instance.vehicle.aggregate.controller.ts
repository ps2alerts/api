import {Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/aggregator.message.interface';
import AggregatorDataHandler from '../../../aggregator.data.handler';
import InstanceVehicleAggregateEntity from '../../../../data/entities/aggregate/instance/instance.vehicle.aggregate.entity';

@Controller()
export default class AggregatorInstanceVehicleAggregateController {
    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MQAcceptedPatterns.INSTANCE_VEHICLE_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        await this.aggregatorDataHandler.upsert(data, context, InstanceVehicleAggregateEntity);
    }
}
