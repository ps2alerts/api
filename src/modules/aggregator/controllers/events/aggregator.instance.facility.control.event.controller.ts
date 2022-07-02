import {Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import AggregatorMessageInterface from '../../interfaces/aggregator.message.interface';
import {MqAcceptedPatterns} from '../../../data/ps2alerts-constants/mqAcceptedPatterns';
import InstanceFacilityControlEntity from '../../../data/entities/instance/instance.facilitycontrol.entity';
import AggregatorDataHandler from '../../aggregator.data.handler';

@Controller()
export default class AggregatorInstanceFacilityControlEventController {
    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MqAcceptedPatterns.INSTANCE_FACILITY_CONTROL)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        await this.aggregatorDataHandler.create(data, context, InstanceFacilityControlEntity);
    }
}
