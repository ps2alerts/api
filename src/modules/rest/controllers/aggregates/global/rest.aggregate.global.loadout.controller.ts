import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalLoadoutAggregateEntity from '../../../../data/entities/aggregate/global/global.loadout.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {Loadout} from '../../../../data/ps2alerts-constants/loadout';
import {World} from '../../../../data/ps2alerts-constants/world';
import Pagination from '../../../../../services/mongo/pagination';
import {Bracket} from '../../../../data/ps2alerts-constants/bracket';
import {RedisCacheService} from '../../../../../services/cache/redis.cache.service';
import {BracketPipe} from '../../../pipes/BracketPipe';
import {Ps2AlertsEventTypePipe} from '../../../pipes/Ps2AlertsEventTypePipe';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';
import {BaseGlobalAggregateController} from './BaseGlobalAggregateController';

@ApiTags('Global Loadout Aggregates')
@Controller('aggregates')
export default class RestGlobalLoadoutAggregateController extends BaseGlobalAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {
        super();
    }

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
        @Query('world', OptionalIntPipe) world?: World,
            @Query('bracket', BracketPipe) bracket?: Bracket,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalLoadoutAggregateEntity[]> {
        bracket = this.correctBracket(bracket, ps2AlertsEventType);

        const pagination = new Pagination({sortBy, order, page, pageSize}, false);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const key = `/global/loadout/W:${world}-B:${bracket}-ET:${ps2AlertsEventType}?P:${pagination.getKey()}`;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            await this.mongoOperationsService.findMany(GlobalLoadoutAggregateEntity, {world, bracket, ps2AlertsEventType}, pagination),
            900);
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
            @Query('world', OptionalIntPipe) world?: World,
            @Query('bracket', BracketPipe) bracket?: Bracket,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalLoadoutAggregateEntity | GlobalLoadoutAggregateEntity[]> {
        bracket = this.correctBracket(bracket, ps2AlertsEventType);

        return world
            ? await this.mongoOperationsService.findOne(GlobalLoadoutAggregateEntity, {loadout, world, bracket, ps2AlertsEventType})
            : await this.mongoOperationsService.findMany(GlobalLoadoutAggregateEntity, {loadout, bracket, ps2AlertsEventType}, new Pagination({sortBy, order, page, pageSize}, false));
    }
}
