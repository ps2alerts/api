import {BadRequestException, Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/aggregator.message.interface';
import GlobalFacilityControlAggregateEntity from '../../../../data/entities/aggregate/global/global.facility.control.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@Controller()
export default class AggregatorGlobalFacilityControlAggregateController {
    constructor(private readonly mongoOperationsService: MongoOperationsService) {}

    @EventPattern(MQAcceptedPatterns.GLOBAL_FACILITY_CONTROL_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.mongoOperationsService.update(data, context, GlobalFacilityControlAggregateEntity);
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
            throw new BadRequestException(`Unable to process message! E: ${err.message}`, MQAcceptedPatterns.GLOBAL_FACILITY_CONTROL_AGGREGATE);
        }
    }
}
