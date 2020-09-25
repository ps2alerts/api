import {BadRequestException, Controller} from '@nestjs/common';
import {Ctx, MessagePattern, Payload, RmqContext} from '@nestjs/microservices';
import AggregatorBaseController from '../../AggregatorBaseController';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/AggregatorMessageInterface';
import GlobalOutfitAggregateEntity from '../../../../data/entities/aggregate/global/global.outfit.aggregate.entity';

@Controller()
export default class AggregatorGlobalOutfitAggregateController extends AggregatorBaseController {
    @MessagePattern(MQAcceptedPatterns.GLOBAL_OUTFIT_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.update(data, context, GlobalOutfitAggregateEntity);
        } catch (err) {
            throw new BadRequestException('Unable to process message!', MQAcceptedPatterns.GLOBAL_OUTFIT_AGGREGATE);
        }
    }
}
