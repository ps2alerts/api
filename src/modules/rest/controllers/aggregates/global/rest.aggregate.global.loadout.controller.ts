import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalLoadoutAggregateEntity from '../../../../data/entities/aggregate/global/global.loadout.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {Loadout} from '../../../../data/constants/loadout.consts';
import {World} from '../../../../data/constants/world.consts';
import Pagination from '../../../../../services/mongo/pagination';
import {Bracket} from '../../../../data/constants/bracket.consts';

@ApiTags('Global Loadout Aggregates')
@Controller('aggregates')
export default class RestGlobalLoadoutAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/loadout')
    @ApiOperation({summary: 'Return a filtered list of GlobalLoadoutAggregateEntity aggregates'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of matching GlobalLoadoutAggregateEntity aggregates',
        type: GlobalLoadoutAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('bracket', OptionalIntPipe) bracket?: Bracket,
    ): Promise<GlobalLoadoutAggregateEntity[]> {
        return await this.mongoOperationsService.findMany(GlobalLoadoutAggregateEntity, {world, bracket}, new Pagination({sortBy, order, page, pageSize}, false));
    }

    @Get('global/loadout/:loadout')
    @ApiOperation({summary: 'Returns a single/many GlobalLoadoutAggregateEntity aggregate(s) by loadout ID (and world)'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The GlobalLoadoutAggregateEntity aggregate(s)',
        type: GlobalLoadoutAggregateEntity,
    })
    async findOne(
        @Param('loadout', ParseIntPipe) loadout: Loadout,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('bracket', OptionalIntPipe) bracket?: Bracket,
    ): Promise<GlobalLoadoutAggregateEntity | GlobalLoadoutAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalLoadoutAggregateEntity, {loadout, world, bracket})
            : await this.mongoOperationsService.findMany(GlobalLoadoutAggregateEntity, {loadout, bracket}, new Pagination({sortBy, order, page, pageSize}, false));
    }
}
