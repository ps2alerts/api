import {Controller, Get, Inject, Param} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalFactionCombatAggregateEntity from '../../../../data/entities/aggregate/global/global.faction.combat.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('Global Faction Combat Aggregates')
@Controller('aggregates')
export default class RestGlobalFactionCombatAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/faction')
    @ApiOperation({summary: 'Return a filtered list of GlobalFactionCombatAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalFactionCombatAggregateEntity aggregates',
        type: GlobalFactionCombatAggregateEntity,
        isArray: true,
    })
    async findAll(): Promise<GlobalFactionCombatAggregateEntity[]> {
        return await this.mongoOperationsService.findMany(GlobalFactionCombatAggregateEntity);
    }

    @Get('global/faction/:world')
    @ApiOperation({summary: 'Returns a GlobalFactionCombatAggregateEntity aggregate with given worldId'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalFactionCombatAggregateEntity aggregate',
        type: GlobalFactionCombatAggregateEntity,
    })
    async findOne(@Param('world') world: string): Promise<GlobalFactionCombatAggregateEntity> {
        return await this.mongoOperationsService.findOne(GlobalFactionCombatAggregateEntity, {world: parseInt(world, 10)});
    }
}
