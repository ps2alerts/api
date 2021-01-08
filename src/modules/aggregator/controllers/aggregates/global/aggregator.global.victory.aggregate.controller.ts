import {Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorDataHandler from '../../../aggregator.data.handler';
import GlobalVictoryAggregateEntity from '../../../../data/entities/aggregate/global/global.victory.aggregate.entity';
import GlobalAggregatorMessageInterface from '../../../interfaces/global.aggregator.message.interface';

@Controller()
export default class AggregatorGlobalVictoryAggregateController {
    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MQAcceptedPatterns.GLOBAL_VICTORY_AGGREGATE)
    public async process(@Payload() data: GlobalAggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        // Convert to proper dates

        await this.aggregatorDataHandler.upsertGlobal(
            await this.aggregatorDataHandler.transformGlobal(data),
            context,
            GlobalVictoryAggregateEntity,
        );
    }
}
