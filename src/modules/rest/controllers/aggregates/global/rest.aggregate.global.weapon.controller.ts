import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalWeaponAggregateEntity from '../../../../data/entities/aggregate/global/global.weapon.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPIpe';
import {World} from '../../../../data/constants/world.consts';
import {ApiImplicitQuery} from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import {WORLD_IMPLICIT_QUERY} from '../../common/rest.world.query';

@ApiTags('Global Weapon Aggregates')
@Controller('aggregates')
export default class RestGlobalWeaponAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/weapon')
    @ApiOperation({summary: 'Return a filtered list of GlobalWeaponAggregateEntity aggregates'})
    @ApiImplicitQuery(WORLD_IMPLICIT_QUERY)
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalWeaponAggregateEntity aggregates',
        type: GlobalWeaponAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world', OptionalIntPipe) world?: World): Promise<GlobalWeaponAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(GlobalWeaponAggregateEntity, {world})
            : await this.mongoOperationsService.findMany(GlobalWeaponAggregateEntity);
    }

    @Get('global/weapon/:weapon')
    @ApiOperation({summary: 'Returns GlobalWeaponAggregateEntity aggregate(s) with given Id (or one of each world)'})
    @ApiImplicitQuery(WORLD_IMPLICIT_QUERY)
    @ApiResponse({
        status: 200,
        description: 'The GlobalWeaponAggregateEntity aggregate(s)',
        type: GlobalWeaponAggregateEntity,
    })
    async findOne(
        @Param('weapon', ParseIntPipe) weapon: number,
            @Query('world', OptionalIntPipe) world?: World,
    ): Promise<GlobalWeaponAggregateEntity | GlobalWeaponAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalWeaponAggregateEntity, {weapon, world})
            : await this.mongoOperationsService.findMany(GlobalWeaponAggregateEntity, {weapon});
    }
}
