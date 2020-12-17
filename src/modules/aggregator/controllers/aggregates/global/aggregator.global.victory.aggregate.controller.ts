import {Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/aggregator.message.interface';
import AggregatorDataHandler from '../../../aggregator.data.handler';
import GlobalVictoryAggregateEntity from '../../../../data/entities/aggregate/global/global.victory.aggregate.entity';

@Controller()
export default class AggregatorGlobalVictoryAggregateController {
    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MQAcceptedPatterns.GLOBAL_VICTORY_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        await this.aggregatorDataHandler.upsert(data, context, GlobalVictoryAggregateEntity);
    }
}
