import {Controller, Logger} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import GlobalOutfitAggregateEntity from '../../../../data/entities/aggregate/global/global.outfit.aggregate.entity';
import AggregatorDataHandler from '../../../aggregator.data.handler';
import GlobalAggregatorMessageInterface from '../../../interfaces/global.aggregator.message.interface';

@Controller()
export default class AggregatorGlobalOutfitAggregateController {
    private readonly logger = new Logger(AggregatorGlobalOutfitAggregateController.name);

    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MQAcceptedPatterns.GLOBAL_OUTFIT_AGGREGATE)
    public async process(@Payload() data: GlobalAggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.aggregatorDataHandler.upsertGlobal(
                await this.aggregatorDataHandler.transformGlobal(data),
                context,
                GlobalOutfitAggregateEntity,
            );
        } catch (e) {
            if (e instanceof Error && !e.message.includes('does not exist')) {
                this.logger.error(`Unable to process ${MQAcceptedPatterns.GLOBAL_OUTFIT_AGGREGATE} message for instance ${data.instance}! Error: ${e.message}`);
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            await context.getChannelRef().ack(context.getMessage());
        }
    }
}
