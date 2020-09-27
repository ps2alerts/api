import {BadRequestException, Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import AggregatorBaseController from '../../aggregator.base.controller';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/aggregator.message.interface';
import InstanceFacilityControlAggregateEntity from '../../../../data/entities/aggregate/instance/instance.facility.control.aggregate.entity';

@Controller()
export default class AggregatorInstanceFacilityControlAggregateController extends AggregatorBaseController {
    @EventPattern(MQAcceptedPatterns.INSTANCE_FACILITY_CONTROL_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.update(data, context, InstanceFacilityControlAggregateEntity);
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
            throw new BadRequestException(`Unable to process message! E: ${err.message}`, MQAcceptedPatterns.INSTANCE_FACILITY_CONTROL_AGGREGATE);
        }
    }
}
