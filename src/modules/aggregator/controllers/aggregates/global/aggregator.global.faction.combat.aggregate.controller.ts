import {BadRequestException, Controller} from '@nestjs/common';
import {Ctx, MessagePattern, Payload, RmqContext} from '@nestjs/microservices';
import AggregatorBaseController from '../../aggregator.base.controller';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/aggregator.message.interface';
import GlobalFactionCombatAggregateEntity from '../../../../data/entities/aggregate/global/global.faction.combat.entity';

@Controller()
export default class AggregatorGlobalFactionCombatAggregateController extends AggregatorBaseController {
    @MessagePattern(MQAcceptedPatterns.GLOBAL_FACTION_COMBAT_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.update(data, context, GlobalFactionCombatAggregateEntity);
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
            throw new BadRequestException(`Unable to process message! E: ${err.message}`, MQAcceptedPatterns.GLOBAL_FACTION_COMBAT_AGGREGATE);
        }
    }
}
