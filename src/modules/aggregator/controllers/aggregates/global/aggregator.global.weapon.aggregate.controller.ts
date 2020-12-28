import {Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import GlobalWeaponAggregateEntity from '../../../../data/entities/aggregate/global/global.weapon.aggregate.entity';
import AggregatorDataHandler from '../../../aggregator.data.handler';
import GlobalAggregatorMessageInterface from '../../../interfaces/global.aggregator.message.interface';

@Controller()
export default class AggregatorGlobalWeaponAggregateController {
    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MQAcceptedPatterns.GLOBAL_WEAPON_AGGREGATE)
    public async process(@Payload() data: GlobalAggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        await this.aggregatorDataHandler.upsertGlobal(
            await this.aggregatorDataHandler.transformGlobal(data),
            context,
            GlobalWeaponAggregateEntity,
        );
    }
}
