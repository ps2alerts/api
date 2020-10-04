import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import RestBaseController from '../../rest.base.controller';
import InstanceWeaponAggregateEntity from '../../../../data/entities/aggregate/instance/instance.weapon.aggregate.entity';

@ApiTags('instance_weapon_aggregate')
@Controller('aggregates')
export default class RestInstanceWeaponAggregateController extends RestBaseController<InstanceWeaponAggregateEntity>{

    constructor(
    @InjectRepository(InstanceWeaponAggregateEntity) repository: Repository<InstanceWeaponAggregateEntity>,
    ) {
        super(repository);
    }

    @Get('instance/weapon')
    @ApiOperation({summary: 'Return a filtered list of InstanceWeaponAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceWeaponAggregateEntity aggregates',
        type: InstanceWeaponAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('instance') instanceQuery?: string): Promise<InstanceWeaponAggregateEntity[]> {
        return await instanceQuery ? this.findEntities({instance: instanceQuery}) : this.findEntities();
    }

    @Get('instance/weapon/:id')
    @ApiOperation({summary: 'Returns a InstanceWeaponAggregateEntity aggregate with given Id (or one of each instance)'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceWeaponAggregateEntity aggregate',
        type: InstanceWeaponAggregateEntity,
    })
    async findOne(@Param('id') id: number, @Query('instance') instanceQuery?: string): Promise<InstanceWeaponAggregateEntity | InstanceWeaponAggregateEntity[]> {
        return await instanceQuery ? this.findEntity({weapon: id, instance: instanceQuery}) : this.findEntitiesById('weapon', id);
    }
}
