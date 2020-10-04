import {Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from '@nestjs/microservices';
import {MQAcceptedPatterns} from '../../../../data/constants/MQAcceptedPatterns';
import AggregatorMessageInterface from '../../../interfaces/aggregator.message.interface';
import GlobalCharacterAggregateEntity from '../../../../data/entities/aggregate/global/global.character.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@Controller()
export default class AggregatorGlobalCharacterAggregateController {
    constructor(private readonly mongoOperationsService: MongoOperationsService) {}

    @EventPattern(MQAcceptedPatterns.GLOBAL_CHARACTER_AGGREGATE)
    public async process(@Payload() data: AggregatorMessageInterface, @Ctx() context: RmqContext): Promise<void> {
        await this.mongoOperationsService.update(data, context, GlobalCharacterAggregateEntity);
    }
}
