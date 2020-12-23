import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalWeaponAggregateEntity from '../../../../data/entities/aggregate/global/global.weapon.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {World} from '../../../../data/constants/world.consts';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import Pagination from '../../../../../services/mongo/pagination';

@ApiTags('Global Weapon Aggregates')
@Controller('aggregates')
export default class RestGlobalWeaponAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/weapon')
    @ApiOperation({summary: 'Return a filtered list of GlobalWeaponAggregateEntity aggregates'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalWeaponAggregateEntity aggregates',
        type: GlobalWeaponAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalWeaponAggregateEntity[]> {
        return await this.mongoOperationsService.findMany(GlobalWeaponAggregateEntity, {world}, new Pagination({sortBy, order, page, pageSize}, 'global'));
    }

    @Get('global/weapon/:weapon')
    @ApiOperation({summary: 'Returns GlobalWeaponAggregateEntity aggregate(s) with given Id (or one of each world)'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The GlobalWeaponAggregateEntity aggregate(s)',
        type: GlobalWeaponAggregateEntity,
    })
    async findOne(
        @Param('weapon', ParseIntPipe) weapon: number,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalWeaponAggregateEntity | GlobalWeaponAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalWeaponAggregateEntity, {'weapon.id': weapon, world})
            : await this.mongoOperationsService.findMany(GlobalWeaponAggregateEntity, {'weapon.id': weapon}, new Pagination({sortBy, order, page, pageSize}, 'global'));
    }
}
