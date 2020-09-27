import {BadRequestException, Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import AggregatorBaseController from '../../aggregator.base.controller';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/aggregator.message.interface';
import GlobalCharacterAggregateEntity from '../../../../data/entities/aggregate/global/global.character.aggregate.entity';

@Controller()
export default class AggregatorGlobalCharacterAggregateController extends AggregatorBaseController {
    @EventPattern(MQAcceptedPatterns.GLOBAL_CHARACTER_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.update(data, context, GlobalCharacterAggregateEntity);
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
            throw new BadRequestException(`Unable to process message! E: ${err.message}`, MQAcceptedPatterns.GLOBAL_CHARACTER_AGGREGATE);
        }
    }
}
