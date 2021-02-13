import {Controller, Logger} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import GlobalWeaponAggregateEntity from '../../../../data/entities/aggregate/global/global.weapon.aggregate.entity';
import AggregatorDataHandler from '../../../aggregator.data.handler';
import GlobalAggregatorMessageInterface from '../../../interfaces/global.aggregator.message.interface';

@Controller()
export default class AggregatorGlobalWeaponAggregateController {
    private readonly logger = new Logger(AggregatorGlobalWeaponAggregateController.name);

    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MQAcceptedPatterns.GLOBAL_WEAPON_AGGREGATE)
    public async process(@Payload() data: GlobalAggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.aggregatorDataHandler.upsertGlobal(
                await this.aggregatorDataHandler.transformGlobal(data),
                context,
                GlobalWeaponAggregateEntity,
            );
        } catch (e) {
            if (e instanceof Error && !e.message.includes('does not exist')) {
                this.logger.error(`Unable to process ${MQAcceptedPatterns.GLOBAL_WEAPON_AGGREGATE} message for instance ${data.instance}! Error: ${e.message}`);
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            await context.getChannelRef().ack(context.getMessage());
        }
    }
}
