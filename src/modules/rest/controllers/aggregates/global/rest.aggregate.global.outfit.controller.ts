import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalOutfitAggregateEntity from '../../../../data/entities/aggregate/global/global.outfit.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {World} from '../../../../data/ps2alerts-constants/world';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {AGGREGATE_GLOBAL_COMMON_IMPLICIT_QUERIES, COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import Pagination from '../../../../../services/mongo/pagination';
import {Bracket} from '../../../../data/ps2alerts-constants/bracket';
import {RedisCacheService} from '../../../../../services/cache/redis.cache.service';
import {BaseGlobalAggregateController} from './BaseGlobalAggregateController';
import {BracketPipe} from '../../../pipes/BracketPipe';
import {Ps2AlertsEventTypePipe} from '../../../pipes/Ps2AlertsEventTypePipe';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';

@ApiTags('Global Outfit Aggregates')
@Controller('aggregates')
export default class RestGlobalOutfitAggregateController extends BaseGlobalAggregateController{
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {
        super();
    }

    @Get('global/outfit')
    @ApiOperation({summary: 'Return a filtered list of GlobalOutfitAggregateEntity aggregates'})
    @ApiImplicitQueries(AGGREGATE_GLOBAL_COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalOutfitAggregateEntity aggregates',
        type: GlobalOutfitAggregateEntity,
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
    ): Promise<GlobalOutfitAggregateEntity[]> {
        bracket = this.correctBracket(bracket, ps2AlertsEventType);

        const pagination = new Pagination({sortBy, order, page, pageSize}, true);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const key = `/global/outfit/W:${world}-B:${bracket}-ET:${ps2AlertsEventType}?P:${pagination.getKey()}`;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            await this.mongoOperationsService.findMany(GlobalOutfitAggregateEntity, {world, bracket, ps2AlertsEventType}, pagination),
            900);
    }

    @Get('global/outfit/:outfit')
    @ApiOperation({summary: 'Returns a GlobalOutfitAggregateEntity aggregate with given Id (or one of each world as a PS4 outfit may share the same ID as PC)'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The GlobalOutfitAggregateEntity aggregate(s)',
        type: GlobalOutfitAggregateEntity,
        isArray: true,
    })
    async findOne(
        @Param('outfit') outfit: string,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('bracket', BracketPipe) bracket?: Bracket,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalOutfitAggregateEntity | GlobalOutfitAggregateEntity[]> {
        bracket = this.correctBracket(bracket, ps2AlertsEventType);

        return world
            ? await this.mongoOperationsService.findOne(GlobalOutfitAggregateEntity, {world, 'outfit.id': outfit, bracket, ps2AlertsEventType})
            : await this.mongoOperationsService.findMany(GlobalOutfitAggregateEntity, {'outfit.id': outfit, bracket, ps2AlertsEventType}, new Pagination({sortBy, order, page, pageSize}, true));
    }
}
