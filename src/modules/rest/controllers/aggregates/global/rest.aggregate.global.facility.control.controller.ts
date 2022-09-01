import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalFacilityControlAggregateEntity from '../../../../data/entities/aggregate/global/global.facility.control.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {AGGREGATE_GLOBAL_COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {World} from '../../../../data/ps2alerts-constants/world';
import Pagination from '../../../../../services/mongo/pagination';
import {Bracket} from '../../../../data/ps2alerts-constants/bracket';
import {Zone} from '../../../../data/ps2alerts-constants/zone';
import {RedisCacheService} from '../../../../../services/cache/redis.cache.service';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';
import {ZONE_IMPLICIT_QUERY} from '../../common/rest.zone.query';
import {Ps2AlertsEventTypePipe} from '../../../pipes/Ps2AlertsEventTypePipe';
import {BracketPipe} from '../../../pipes/BracketPipe';
import {BaseGlobalAggregateController} from './BaseGlobalAggregateController';

const IMPLICIT_QUERIES = [
    ...AGGREGATE_GLOBAL_COMMON_IMPLICIT_QUERIES,
    ZONE_IMPLICIT_QUERY,
];

@ApiTags('Global Facility Control Aggregates')
@Controller('aggregates')
export default class RestGlobalFacilityControlAggregateController extends BaseGlobalAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {
        super();
    }

    @Get('global/facility')
    @ApiOperation({summary: 'Return a filtered list of GlobalFacilityControlAggregateEntity aggregates'})
    @ApiImplicitQueries(IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of matching GlobalFacilityControlAggregateEntity aggregates',
        type: GlobalFacilityControlAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('zone', OptionalIntPipe) zone?: Zone,
            @Query('bracket', BracketPipe) bracket?: Bracket,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalFacilityControlAggregateEntity[]> {
        bracket = this.correctBracket(bracket, ps2AlertsEventType);

        const pagination = new Pagination({sortBy, order, page, pageSize}, true);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const key = `/global/facility/W:${world}-Z:${zone}-B:${bracket}-ET:${ps2AlertsEventType}?P:${pagination.getKey()}`;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            await this.mongoOperationsService.findMany(GlobalFacilityControlAggregateEntity, {world, 'facility.zone': zone, bracket}, pagination),
            900);
    }

    @Get('global/facility/:facility')
    @ApiOperation({summary: 'Returns the matching GlobalFacilityControlAggregateEntity aggregate(s) with given Id (or one of each world)'})
    @ApiImplicitQueries(IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The GlobalFacilityControlAggregateEntity aggregate(s)',
        type: GlobalFacilityControlAggregateEntity,
    })
    async findOne(
        @Param('facility', ParseIntPipe) facility: number,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('bracket', BracketPipe) bracket?: Bracket,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalFacilityControlAggregateEntity | GlobalFacilityControlAggregateEntity[]> {
        bracket = this.correctBracket(bracket, ps2AlertsEventType);

        return world
            ? await this.mongoOperationsService.findOne(GlobalFacilityControlAggregateEntity, {facility, world, bracket, ps2AlertsEventType})
            : await this.mongoOperationsService.findMany(GlobalFacilityControlAggregateEntity, {facility, bracket, ps2AlertsEventType}, new Pagination({sortBy, order, page, pageSize}, true));
    }
}
