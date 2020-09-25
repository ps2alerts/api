import {BadRequestException, Controller} from '@nestjs/common';
import {Ctx, MessagePattern, Payload, RmqContext} from '@nestjs/microservices';
import AggregatorBaseController from '../../AggregatorBaseController';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/AggregatorMessageInterface';
import InstanceCharacterAggregateEntity from '../../../../data/entities/aggregate/instance/instance.character.aggregate.entity';

@Controller()
export default class AggregatorInstanceCharacterAggregateController extends AggregatorBaseController {
    @MessagePattern(MQAcceptedPatterns.INSTANCE_CHARACTER_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.update(data, context, InstanceCharacterAggregateEntity);
        } catch (err) {
            throw new BadRequestException('Unable to process message!', MQAcceptedPatterns.INSTANCE_CHARACTER_AGGREGATE);
        }
    }
}
