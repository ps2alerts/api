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
import {MandatoryIntPipe} from '../../../pipes/MandatoryIntPipe';

@ApiTags('Global Loadout Aggregates')
@Controller('aggregates')
export default class RestGlobalLoadoutAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
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
        @Query('world', OptionalIntPipe) world?: World,
            @Query('bracket', MandatoryIntPipe) bracket?: Bracket,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalLoadoutAggregateEntity[]> {
        const pagination = new Pagination({sortBy, order, page, pageSize}, false);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const key = `/global/loadout/W:${world}-B:${bracket}?P:${pagination.getKey()}`;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            await this.mongoOperationsService.findMany(GlobalLoadoutAggregateEntity, {world, bracket}, pagination),
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
            @Query('bracket', MandatoryIntPipe) bracket?: Bracket,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalLoadoutAggregateEntity | GlobalLoadoutAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalLoadoutAggregateEntity, {loadout, world, bracket})
            : await this.mongoOperationsService.findMany(GlobalLoadoutAggregateEntity, {loadout, bracket}, new Pagination({sortBy, order, page, pageSize}, false));
    }
}
