import {Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/aggregator.message.interface';
import AggregatorDataHandler from '../../../aggregator.data.handler';
import InstanceVehicleCharacterAggregateEntity from '../../../../data/entities/aggregate/instance/instance.vehicle.character.aggregate.entity';

@Controller()
export default class AggregatorInstanceVehicleCharacterAggregateControllerAggregateController {
    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MQAcceptedPatterns.INSTANCE_VEHICLE_CHARACTER_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        await this.aggregatorDataHandler.upsert(data, context, InstanceVehicleCharacterAggregateEntity);
    }
}
