import {Controller, Logger} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MqAcceptedPatterns} from '../../../../data/ps2alerts-constants/mqAcceptedPatterns';
import GlobalLoadoutAggregateEntity from '../../../../data/entities/aggregate/global/global.loadout.aggregate.entity';
import AggregatorDataHandler from '../../../aggregator.data.handler';
import GlobalAggregatorMessageInterface from '../../../interfaces/global.aggregator.message.interface';

@Controller()
export default class AggregatorGlobalLoadoutAggregateController {
    private readonly logger = new Logger(AggregatorGlobalLoadoutAggregateController.name);

    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MqAcceptedPatterns.GLOBAL_LOADOUT_AGGREGATE)
    public async process(@Payload() data: GlobalAggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.aggregatorDataHandler.upsertGlobal(
                await this.aggregatorDataHandler.transformGlobal(data),
                context,
                GlobalLoadoutAggregateEntity,
            );
        } catch (e) {
            await this.aggregatorDataHandler.settleGlobalFailure(context, e, MqAcceptedPatterns.GLOBAL_LOADOUT_AGGREGATE, data.instance);
        }
    }
}
