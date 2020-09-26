import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import RestBaseController from '../../rest.base.controller';
import {World} from '../../../../data/constants/world.consts';
import GlobalWeaponAggregateEntity from '../../../../data/entities/aggregate/global/global.weapon.aggregate.entity';

@ApiTags('global_weapon_aggregate')
@Controller('aggregates')
export default class RestGlobalWeaponAggregateController extends RestBaseController<GlobalWeaponAggregateEntity>{

    constructor(
    @InjectRepository(GlobalWeaponAggregateEntity) repository: Repository<GlobalWeaponAggregateEntity>,
    ) {
        super(repository);
    }

    @Get('global/weapon')
    @ApiOperation({summary: 'Return a filtered list of GlobalWeaponAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalWeaponAggregateEntity aggregates',
        type: GlobalWeaponAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world') worldQuery?: World): Promise<GlobalWeaponAggregateEntity[]> {
        return await worldQuery ? this.findEntities({world: worldQuery}) : this.findEntities();
    }

    @Get('global/weapon/:id')
    @ApiOperation({summary: 'Returns a GlobalWeaponAggregateEntity aggregate with given Id (or one of each world)'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalWeaponAggregateEntity aggregate',
        type: GlobalWeaponAggregateEntity,
    })
    async findOne(@Param('id') id: number, @Query('world') worldQuery?: World): Promise<GlobalWeaponAggregateEntity | GlobalWeaponAggregateEntity[]> {
        return await worldQuery ? this.findEntity({weapon: id, world: worldQuery}) : this.findEntitiesById('weapon', id);
    }
}
