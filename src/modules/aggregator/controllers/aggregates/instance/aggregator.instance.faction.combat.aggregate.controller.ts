import {BadRequestException, Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import AggregatorBaseController from '../../aggregator.base.controller';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/aggregator.message.interface';
import InstanceFactionCombatAggregateEntity from '../../../../data/entities/aggregate/instance/instance.faction.combat.aggregate.entity';

@Controller()
export default class AggregatorInstanceFactionCombatAggregateController extends AggregatorBaseController {
    @EventPattern(MQAcceptedPatterns.INSTANCE_FACTION_COMBAT_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.update(data, context, InstanceFactionCombatAggregateEntity);
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
            throw new BadRequestException(`Unable to process message! E: ${err.message}`, MQAcceptedPatterns.INSTANCE_FACTION_COMBAT_AGGREGATE);
        }
    }
}
