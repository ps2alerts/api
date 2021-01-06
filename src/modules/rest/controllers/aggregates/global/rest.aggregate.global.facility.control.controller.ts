import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalFacilityControlAggregateEntity from '../../../../data/entities/aggregate/global/global.facility.control.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {World} from '../../../../data/constants/world.consts';
import Pagination from '../../../../../services/mongo/pagination';
import {Bracket} from '../../../../data/constants/bracket.consts';

@ApiTags('Global Facility Control Aggregates')
@Controller('aggregates')
export default class RestGlobalFacilityControlAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/facility')
    @ApiOperation({summary: 'Return a filtered list of GlobalFacilityControlAggregateEntity aggregates'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of matching GlobalFacilityControlAggregateEntity aggregates',
        type: GlobalFacilityControlAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
            @Query('bracket', OptionalIntPipe) bracket?: Bracket,
    ): Promise<GlobalFacilityControlAggregateEntity[]> {
        return await this.mongoOperationsService.findMany(GlobalFacilityControlAggregateEntity, {world, bracket}, new Pagination({sortBy, order, page, pageSize}, true));
    }

    @Get('global/facility/:facility')
    @ApiOperation({summary: 'Returns the matching GlobalFacilityControlAggregateEntity aggregate(s) with given Id (or one of each world)'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The GlobalFacilityControlAggregateEntity aggregate(s)',
        type: GlobalFacilityControlAggregateEntity,
    })
    async findOne(
        @Param('facility', ParseIntPipe) facility: number,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
            @Query('bracket', OptionalIntPipe) bracket?: Bracket,
    ): Promise<GlobalFacilityControlAggregateEntity | GlobalFacilityControlAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalFacilityControlAggregateEntity, {facility, world, bracket})
            : await this.mongoOperationsService.findMany(GlobalFacilityControlAggregateEntity, {facility, bracket}, new Pagination({sortBy, order, page, pageSize}, true));
    }
}
