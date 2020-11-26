import {Controller, Get, Inject, Param} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceFactionCombatAggregateEntity from '../../../../data/entities/aggregate/instance/instance.faction.combat.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('Instance Faction Combat Aggregates')
@Controller('aggregates')
export default class RestInstanceFactionCombatAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/faction')
    @ApiOperation({summary: 'Returns the InstanceFactionCombatAggregateEntity for an instance'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceFactionCombatAggregateEntity aggregate',
        type: InstanceFactionCombatAggregateEntity,
    })
    async findOne(
        @Param('instance') instance: string,
    ): Promise<InstanceFactionCombatAggregateEntity> {
        return this.mongoOperationsService.findOne(InstanceFactionCombatAggregateEntity, {instance});
    }
}
