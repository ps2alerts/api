import {BadRequestException, Controller} from '@nestjs/common';
import {Ctx, MessagePattern, Payload, RmqContext} from '@nestjs/microservices';
import AggregatorBaseController from '../../aggregator.base.controller';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/aggregator.message.interface';
import InstancePopulationAggregateEntity from '../../../../data/entities/aggregate/instance/instance.population.aggregate.entity';

@Controller()
export default class AggregatorInstancePopulationAggregateController extends AggregatorBaseController {
    @MessagePattern(MQAcceptedPatterns.INSTANCE_POPULATION_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.create(data, context, InstancePopulationAggregateEntity);
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
            throw new BadRequestException(`Unable to process message! E: ${err.message}`, MQAcceptedPatterns.INSTANCE_POPULATION_AGGREGATE);
        }
    }
}
