import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import RestBaseController from '../../rest.base.controller';
import InstanceFactionCombatAggregateEntity from '../../../../data/entities/aggregate/instance/instance.faction.combat.aggregate.entity';

@ApiTags('instance_faction_combat_aggregate')
@Controller('aggregates')
export default class RestInstanceFactionCombatAggregateController extends RestBaseController<InstanceFactionCombatAggregateEntity>{

    constructor(
    @InjectRepository(InstanceFactionCombatAggregateEntity) repository: Repository<InstanceFactionCombatAggregateEntity>,
    ) {
        super(repository);
    }

    @Get('instance/faction')
    @ApiOperation({summary: 'Return all InstanceFactionCombatAggregateEntity aggregates'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceFactionCombatAggregateEntity aggregates',
        type: InstanceFactionCombatAggregateEntity,
        isArray: true,
    })
    async findAll(): Promise<InstanceFactionCombatAggregateEntity[]> {
        return await this.findEntities();
    }

    @Get('instance/faction/:id')
    @ApiOperation({summary: 'Returns a InstanceFactionCombatAggregateEntity aggregate with given instance'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceFactionCombatAggregateEntity aggregate',
        type: InstanceFactionCombatAggregateEntity,
    })
    async findOne(@Param('id') id: string): Promise<InstanceFactionCombatAggregateEntity> {
        return await this.findEntity({instance: id});
    }
}
