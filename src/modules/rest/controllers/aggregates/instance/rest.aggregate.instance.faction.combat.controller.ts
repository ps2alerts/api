import {Controller, Get, Inject, Param} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceFactionCombatAggregateEntity from '../../../../data/entities/aggregate/instance/instance.faction.combat.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('instance_faction_combat_aggregate')
@Controller('aggregates')
export default class RestInstanceFactionCombatAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/faction')
    @ApiOperation({summary: 'Returns a list of InstanceFactionCombatAggregateEntity for an instance'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceFactionCombatAggregateEntity aggregates',
        type: InstanceFactionCombatAggregateEntity,
        isArray: true,
    })
    async findAll(@Param('instance') instance?: string): Promise<InstanceFactionCombatAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceFactionCombatAggregateEntity, {instance});
    }
}
