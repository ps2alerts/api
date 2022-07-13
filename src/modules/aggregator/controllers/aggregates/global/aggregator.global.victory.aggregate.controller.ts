import {Controller, Logger} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MqAcceptedPatterns} from '../../../../data/ps2alerts-constants/mqAcceptedPatterns';
import AggregatorDataHandler from '../../../aggregator.data.handler';
import GlobalVictoryAggregateEntity from '../../../../data/entities/aggregate/global/global.victory.aggregate.entity';
import GlobalAggregatorMessageInterface from '../../../interfaces/global.aggregator.message.interface';

@Controller()
export default class AggregatorGlobalVictoryAggregateController {
    private readonly logger = new Logger(AggregatorGlobalVictoryAggregateController.name);

    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MqAcceptedPatterns.GLOBAL_VICTORY_AGGREGATE)
    public async process(@Payload() data: GlobalAggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.aggregatorDataHandler.upsertGlobal(
                await this.aggregatorDataHandler.transformGlobal(data),
                context,
                GlobalVictoryAggregateEntity,
            );
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
            this.logger.error(`Unable to process ${MqAcceptedPatterns.GLOBAL_VICTORY_AGGREGATE} message for instance ${data.instance}! Error: ${(<Error>e).message}`);

            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            await context.getChannelRef().ack(context.getMessage());
        }
    }
}
