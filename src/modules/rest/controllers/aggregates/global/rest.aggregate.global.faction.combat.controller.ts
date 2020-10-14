import {Controller, Get, Inject, Param} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalFactionCombatAggregateEntity from '../../../../data/entities/aggregate/global/global.faction.combat.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {ApiImplicitQuery} from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import {WORLD_IMPLICIT_QUERY} from '../../common/rest.world.query';
import {NullableIntPipe} from '../../../pipes/NullableIntPipe';
import {World} from '../../../../data/constants/world.consts';

@ApiTags('Global Faction Combat Aggregates')
@Controller('aggregates')
export default class RestGlobalFactionCombatAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/faction')
    @ApiOperation({summary: 'Return a filtered list of GlobalFactionCombatAggregateEntity aggregates'})
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
    @ApiOperation({summary: 'Returns a GlobalFactionCombatAggregateEntity aggregate with given world'})
    @ApiImplicitQuery(WORLD_IMPLICIT_QUERY)
    @ApiResponse({
        status: 200,
        description: 'The GlobalFactionCombatAggregateEntity aggregate',
        type: GlobalFactionCombatAggregateEntity,
    })
    async findOne(@Param('world', NullableIntPipe) world: World): Promise<GlobalFactionCombatAggregateEntity> {
        return await this.mongoOperationsService.findOne(GlobalFactionCombatAggregateEntity, {world});
    }
}
