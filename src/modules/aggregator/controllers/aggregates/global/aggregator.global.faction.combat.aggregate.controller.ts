import {Controller, Logger} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MqAcceptedPatterns} from '../../../../data/ps2alerts-constants/mqAcceptedPatterns';
import GlobalFactionCombatAggregateEntity from '../../../../data/entities/aggregate/global/global.faction.combat.aggregate.entity';
import AggregatorDataHandler from '../../../aggregator.data.handler';
import GlobalAggregatorMessageInterface from '../../../interfaces/global.aggregator.message.interface';

@Controller()
export default class AggregatorGlobalFactionCombatAggregateController {
    private readonly logger = new Logger(AggregatorGlobalFactionCombatAggregateController.name);

    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MqAcceptedPatterns.GLOBAL_FACTION_COMBAT_AGGREGATE)
    public async process(@Payload() data: GlobalAggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.aggregatorDataHandler.upsertGlobal(
                await this.aggregatorDataHandler.transformGlobal(data),
                context,
                GlobalFactionCombatAggregateEntity,
            );
        } catch (e) {
            await this.aggregatorDataHandler.settleGlobalFailure(context, e, MqAcceptedPatterns.GLOBAL_FACTION_COMBAT_AGGREGATE, data.instance);
        }
    }
}
