import {BadRequestException, Controller} from '@nestjs/common';
import {Ctx, MessagePattern, Payload, RmqContext} from '@nestjs/microservices';
import AggregatorMessageInterface from '../../interfaces/AggregatorMessageInterface';
import AggregatorBaseController from '../AggregatorBaseController';
import {MQAcceptedPatterns} from '../../../data/constants/MQAcceptedPatterns';
import InstanceFacilityControlEntity from '../../../data/entities/instance/instance.facilitycontrol.entity';

@Controller()
export default class AggregatorInstanceFacilityControlEventController extends AggregatorBaseController {
    @MessagePattern(MQAcceptedPatterns.INSTANCE_FACILITY_CONTROL)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        console.log(data);

        try {
            await this.create(data, context, InstanceFacilityControlEntity);
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
            throw new BadRequestException(`Unable to process message! E: ${err.message}`, MQAcceptedPatterns.INSTANCE_FACILITY_CONTROL);
        }
    }
}
