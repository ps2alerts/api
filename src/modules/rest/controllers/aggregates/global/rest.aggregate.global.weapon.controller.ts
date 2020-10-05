import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {World} from '../../../../data/constants/world.consts';
import GlobalWeaponAggregateEntity from '../../../../data/entities/aggregate/global/global.weapon.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('Global Weapon Aggregates')
@Controller('aggregates')
export default class RestGlobalWeaponAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/weapon')
    @ApiOperation({summary: 'Return a filtered list of GlobalWeaponAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalWeaponAggregateEntity aggregates',
        type: GlobalWeaponAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world') world?: World): Promise<GlobalWeaponAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(GlobalWeaponAggregateEntity, {world})
            : await this.mongoOperationsService.findMany(GlobalWeaponAggregateEntity);
    }

    @Get('global/weapon/:id')
    @ApiOperation({summary: 'Returns a GlobalWeaponAggregateEntity aggregate with given Id (or one of each world)'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalWeaponAggregateEntity aggregate',
        type: GlobalWeaponAggregateEntity,
    })
    async findOne(@Param('id') id: number, @Query('world') world?: World): Promise<GlobalWeaponAggregateEntity | GlobalWeaponAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalWeaponAggregateEntity, {outfit: id, world})
            : await this.mongoOperationsService.findOne(GlobalWeaponAggregateEntity, {outfit: id});
    }
}
