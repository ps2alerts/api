import {BadRequestException, Controller} from '@nestjs/common';
import {Ctx, MessagePattern, Payload, RmqContext} from '@nestjs/microservices';
import AggregatorBaseController from '../../AggregatorBaseController';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/AggregatorMessageInterface';
import InstanceClassAggregateEntity from '../../../../data/entities/aggregate/instance/instance.class.aggregate.entity';

@Controller()
export default class AggregatorInstanceClassAggregateController extends AggregatorBaseController {
    @MessagePattern(MQAcceptedPatterns.INSTANCE_CLASS_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.update(data, context, InstanceClassAggregateEntity);
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
            throw new BadRequestException(`Unable to process message! E: ${err.message}`, MQAcceptedPatterns.INSTANCE_CLASS_AGGREGATE);
        }
    }
}
