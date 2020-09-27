import {BadRequestException, Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import AggregatorBaseController from '../../aggregator.base.controller';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/aggregator.message.interface';
import GlobalClassAggregateEntity from '../../../../data/entities/aggregate/global/global.class.aggregate.entity';

@Controller()
export default class AggregatorGlobalClassAggregateController extends AggregatorBaseController {
    @EventPattern(MQAcceptedPatterns.GLOBAL_CLASS_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.update(data, context, GlobalClassAggregateEntity);
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
            throw new BadRequestException(`Unable to process message! E: ${err.message}`, MQAcceptedPatterns.GLOBAL_CLASS_AGGREGATE);
        }
    }
}
