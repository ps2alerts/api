import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalFacilityControlAggregateEntity from '../../../../data/entities/aggregate/global/global.facility.control.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {World} from '../../../../data/ps2alerts-constants/world';
import Pagination from '../../../../../services/mongo/pagination';
import {Bracket} from '../../../../data/ps2alerts-constants/bracket';
import {Zone} from '../../../../data/ps2alerts-constants/zone';
import {RedisCacheService} from '../../../../../services/cache/redis.cache.service';
import {MandatoryIntPipe} from '../../../pipes/MandatoryIntPipe';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';
import {ZONE_IMPLICIT_QUERY} from '../../common/rest.zone.query';
import {BRACKET_IMPLICIT_QUERY} from '../../common/rest.bracket.query';
import {PS2ALERTS_EVENT_TYPE_QUERY} from '../../common/rest.ps2AlertsEventType.query';

const IMPLICIT_QUERIES = [
    ...COMMON_IMPLICIT_QUERIES,
    ZONE_IMPLICIT_QUERY,
    BRACKET_IMPLICIT_QUERY,
    PS2ALERTS_EVENT_TYPE_QUERY,
];

@ApiTags('Global Facility Control Aggregates')
@Controller('aggregates')
export default class RestGlobalFacilityControlAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

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
            @Query('bracket', MandatoryIntPipe) bracket?: Bracket,
            @Query('ps2AlertsEventType', OptionalIntPipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalFacilityControlAggregateEntity[]> {
        if (!ps2AlertsEventType) {
            ps2AlertsEventType = Ps2AlertsEventType.LIVE_METAGAME;
        }

        // If OW, force bracket to be total as brackets don't make sense in OW context
        if (ps2AlertsEventType === Ps2AlertsEventType.OUTFIT_WARS_AUG_2022) {
            bracket = Bracket.TOTAL;
        }

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
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The GlobalFacilityControlAggregateEntity aggregate(s)',
        type: GlobalFacilityControlAggregateEntity,
    })
    async findOne(
        @Param('facility', ParseIntPipe) facility: number,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('bracket', MandatoryIntPipe) bracket?: Bracket,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalFacilityControlAggregateEntity | GlobalFacilityControlAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalFacilityControlAggregateEntity, {facility, world, bracket})
            : await this.mongoOperationsService.findMany(GlobalFacilityControlAggregateEntity, {facility, bracket}, new Pagination({sortBy, order, page, pageSize}, true));
    }
}
