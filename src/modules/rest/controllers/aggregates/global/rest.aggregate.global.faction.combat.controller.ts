import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import RestBaseController from '../../rest.base.controller';
import {World} from '../../../../data/constants/world.consts';
import GlobalFactionCombatAggregateEntity from '../../../../data/entities/aggregate/global/global.faction.combat.aggregate.entity';

@ApiTags('global_faction_combat_aggregate')
@Controller('aggregates')
export default class RestGlobalFactionCombatAggregateController extends RestBaseController<GlobalFactionCombatAggregateEntity>{

    constructor(
    @InjectRepository(GlobalFactionCombatAggregateEntity) repository: Repository<GlobalFactionCombatAggregateEntity>,
    ) {
        super(repository);
    }

    @Get('global/faction')
    @ApiOperation({summary: 'Return a filtered list of GlobalFactionCombatAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalFactionCombatAggregateEntity aggregates',
        type: GlobalFactionCombatAggregateEntity,
        isArray: true,
    })
    async findAll(): Promise<GlobalFactionCombatAggregateEntity[]> {
        return await this.findEntities();
    }

    @Get('global/faction/:id')
    @ApiOperation({summary: 'Returns a GlobalFactionCombatAggregateEntity aggregate with given worldId'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalFactionCombatAggregateEntity aggregate',
        type: GlobalFactionCombatAggregateEntity,
    })
    async findOne(@Param('id') id: World): Promise<GlobalFactionCombatAggregateEntity> {
        return await this.findEntity({world: id});
    }
}
