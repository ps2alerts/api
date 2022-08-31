import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalFactionCombatAggregateEntity from '../../../../data/entities/aggregate/global/global.faction.combat.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {WORLD_IMPLICIT_QUERY} from '../../common/rest.world.query';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {World} from '../../../../data/ps2alerts-constants/world';
import Pagination from '../../../../../services/mongo/pagination';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {Bracket} from '../../../../data/ps2alerts-constants/bracket';
import {RedisCacheService} from '../../../../../services/cache/redis.cache.service';
import {BracketPipe} from '../../../pipes/BracketPipe';
import {Ps2AlertsEventTypePipe} from '../../../pipes/Ps2AlertsEventTypePipe';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';
import {AGGREGATE_GLOBAL_COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {BRACKET_IMPLICIT_QUERY} from '../../common/rest.bracket.query';
import {PS2ALERTS_EVENT_TYPE_QUERY} from '../../common/rest.ps2AlertsEventType.query';

@ApiTags('Global Faction Combat Aggregates')
@Controller('aggregates')
export default class RestGlobalFactionCombatAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    @Get('global/faction')
    @ApiOperation({summary: 'Return a filtered list of GlobalFactionCombatAggregateEntity aggregates'})
    @ApiImplicitQueries(AGGREGATE_GLOBAL_COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalFactionCombatAggregateEntity aggregates',
        type: GlobalFactionCombatAggregateEntity,
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
    ): Promise<GlobalFactionCombatAggregateEntity[]> {
        const pagination = new Pagination({sortBy, order, page, pageSize}, true);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const key = `/global/faction/W:${world}-B:${bracket}-ET:${ps2AlertsEventType}?P:${pagination.getKey()}`;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            await this.mongoOperationsService.findMany(GlobalFactionCombatAggregateEntity, {world, bracket, ps2AlertsEventType}, pagination),
            900);
    }

    // This seems kinda pointless...
    @Get('global/faction/:world')
    @ApiOperation({summary: 'Returns a GlobalFactionCombatAggregateEntity aggregate with given world'})
    @ApiImplicitQueries([WORLD_IMPLICIT_QUERY, BRACKET_IMPLICIT_QUERY, PS2ALERTS_EVENT_TYPE_QUERY])
    @ApiResponse({
        status: 200,
        description: 'The GlobalFactionCombatAggregateEntity aggregate',
        type: GlobalFactionCombatAggregateEntity,
    })
    async findOne(
        @Param('world', OptionalIntPipe) world: World,
            @Query('bracket', BracketPipe) bracket?: Bracket,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
    ): Promise<GlobalFactionCombatAggregateEntity> {
        return await this.mongoOperationsService.findOne(GlobalFactionCombatAggregateEntity, {world, bracket, ps2AlertsEventType});
    }
}
