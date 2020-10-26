import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalClassAggregateEntity from '../../../../data/entities/aggregate/global/global.class.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {Loadout} from '../../../../data/constants/loadout.consts';
import {World} from '../../../../data/constants/world.consts';
import Pagination from '../../../../../services/mongo/pagination';

@ApiTags('Global Class Aggregates')
@Controller('aggregates')
export default class RestGlobalClassAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/class')
    @ApiOperation({summary: 'Return a filtered list of GlobalClassAggregateEntity aggregates'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of matching GlobalClassAggregateEntity aggregates',
        type: GlobalClassAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalClassAggregateEntity[]> {
        return await this.mongoOperationsService.findMany(GlobalClassAggregateEntity, {world}, new Pagination({sortBy, order, page, pageSize}));
    }

    @Get('global/class/:loadout')
    @ApiOperation({summary: 'Returns a single/many GlobalClassAggregateEntity aggregate(s) by loadout ID (and world)'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The GlobalClassAggregateEntity aggregate(s)',
        type: GlobalClassAggregateEntity,
    })
    async findOne(
        @Param('loadout', ParseIntPipe) loadout: Loadout,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalClassAggregateEntity | GlobalClassAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalClassAggregateEntity, {class: loadout, world})
            : await this.mongoOperationsService.findMany(GlobalClassAggregateEntity, {class: loadout}, new Pagination({sortBy, order, page, pageSize}));
    }
}
