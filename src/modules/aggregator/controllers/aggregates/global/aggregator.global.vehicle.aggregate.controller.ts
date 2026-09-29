import {Controller, Logger} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MqAcceptedPatterns} from '../../../../data/ps2alerts-constants/mqAcceptedPatterns';
import AggregatorDataHandler from '../../../aggregator.data.handler';
import GlobalVehicleAggregateEntity from '../../../../data/entities/aggregate/global/global.vehicle.aggregate.entity';
import GlobalAggregatorMessageInterface from '../../../interfaces/global.aggregator.message.interface';

@Controller()
export default class AggregatorGlobalVehicleAggregateController {
    private readonly logger = new Logger(AggregatorGlobalVehicleAggregateController.name);

    constructor(private readonly aggregatorDataHandler: AggregatorDataHandler) {}

    @EventPattern(MqAcceptedPatterns.GLOBAL_VEHICLE_AGGREGATE)
    public async process(@Payload() data: GlobalAggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        try {
            await this.aggregatorDataHandler.upsertGlobal(
                await this.aggregatorDataHandler.transformGlobal(data),
                context,
                GlobalVehicleAggregateEntity,
            );
        } catch (e) {
            await this.aggregatorDataHandler.settleGlobalFailure(context, e, MqAcceptedPatterns.GLOBAL_VEHICLE_AGGREGATE, data.instance);
        }
    }
}
