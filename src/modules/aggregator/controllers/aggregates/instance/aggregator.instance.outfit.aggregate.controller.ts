import {Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/aggregator.message.interface';
import InstanceOutfitAggregateEntity from '../../../../data/entities/aggregate/instance/instance.outfit.aggregate.entity';
import AggregatorDataHandler from '../../../aggregator.data.handler';

@Controller()
export default class AggregatorInstanceOutfitAggregateController {
    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MQAcceptedPatterns.INSTANCE_OUTFIT_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        await this.aggregatorDataHandler.upsert(data, context, InstanceOutfitAggregateEntity);
    }
}
