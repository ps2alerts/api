import {BadRequestException, Controller} from '@nestjs/common';
import {Ctx, MessagePattern, Payload, RmqContext} from '@nestjs/microservices';
import InstanceDeathEntity from '../../../data/entities/instance/instance.death.entity';
import AggregatorMessageInterface from '../../interfaces/AggregatorMessageInterface';
import AggregatorBaseController from '../AggregatorBaseController';
import {MQAcceptedPatterns} from '../../../data/constants/MQAcceptedPatterns';

@Controller()
export default class AggregatorInstanceDeathEventController extends AggregatorBaseController {
    @MessagePattern(MQAcceptedPatterns.INSTANCE_DEATH)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.create(data, context, InstanceDeathEntity);
        } catch (err) {
            throw new BadRequestException('Unable to process message!', MQAcceptedPatterns.INSTANCE_DEATH);
        }
    }
}
