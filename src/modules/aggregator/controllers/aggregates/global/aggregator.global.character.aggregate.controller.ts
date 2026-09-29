import {Controller, Logger} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MqAcceptedPatterns} from '../../../../data/ps2alerts-constants/mqAcceptedPatterns';
import GlobalCharacterAggregateEntity from '../../../../data/entities/aggregate/global/global.character.aggregate.entity';
import AggregatorDataHandler from '../../../aggregator.data.handler';
import GlobalAggregatorMessageInterface from '../../../interfaces/global.aggregator.message.interface';

@Controller()
export default class AggregatorGlobalCharacterAggregateController {
    private readonly logger = new Logger(AggregatorGlobalCharacterAggregateController.name);

    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MqAcceptedPatterns.GLOBAL_CHARACTER_AGGREGATE)
    public async process(@Payload() data: GlobalAggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.aggregatorDataHandler.upsertGlobal(
                await this.aggregatorDataHandler.transformGlobal(data),
                context,
                GlobalCharacterAggregateEntity,
            );
        } catch (e) {
            await this.aggregatorDataHandler.settleGlobalFailure(context, e, MqAcceptedPatterns.GLOBAL_CHARACTER_AGGREGATE, data.instance);
        }
    }
}
