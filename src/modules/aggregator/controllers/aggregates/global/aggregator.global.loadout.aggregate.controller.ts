import {Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import GlobalLoadoutAggregateEntity from '../../../../data/entities/aggregate/global/global.loadout.aggregate.entity';
import AggregatorDataHandler from '../../../aggregator.data.handler';
import GlobalAggregatorMessageInterface from '../../../interfaces/global.aggregator.message.interface';

@Controller()
export default class AggregatorGlobalLoadoutAggregateController {
    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MQAcceptedPatterns.GLOBAL_LOADOUT_AGGREGATE)
    public async process(@Payload() data: GlobalAggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        await this.aggregatorDataHandler.upsertGlobal(
            await this.aggregatorDataHandler.transformGlobal(data),
            context,
            GlobalLoadoutAggregateEntity,
        );
    }
}
