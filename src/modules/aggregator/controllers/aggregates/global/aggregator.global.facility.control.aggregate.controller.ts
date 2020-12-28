import {Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import GlobalFacilityControlAggregateEntity from '../../../../data/entities/aggregate/global/global.facility.control.aggregate.entity';
import AggregatorDataHandler from '../../../aggregator.data.handler';
import GlobalAggregatorMessageInterface from '../../../interfaces/global.aggregator.message.interface';

@Controller()
export default class AggregatorGlobalFacilityControlAggregateController {
    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MQAcceptedPatterns.GLOBAL_FACILITY_CONTROL_AGGREGATE)
    public async process(@Payload() data: GlobalAggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        await this.aggregatorDataHandler.upsertGlobal(
            await this.aggregatorDataHandler.transformGlobal(data),
            context,
            GlobalFacilityControlAggregateEntity,
        );
    }
}
