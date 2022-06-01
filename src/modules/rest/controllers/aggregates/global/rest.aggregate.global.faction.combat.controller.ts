import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalFactionCombatAggregateEntity from '../../../../data/entities/aggregate/global/global.faction.combat.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {ApiImplicitQuery} from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import {WORLD_IMPLICIT_QUERY} from '../../common/rest.world.query';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {World} from '../../../../data/constants/world.consts';
import Pagination from '../../../../../services/mongo/pagination';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {PAGINATION_IMPLICIT_QUERIES} from '../../common/rest.pagination.queries';
import {Bracket} from '../../../../data/constants/bracket.consts';
import {RedisCacheService} from '../../../../../services/cache/redis.cache.service';
import {MandatoryIntPipe} from '../../../pipes/MandatoryIntPipe';

@ApiTags('Global Faction Combat Aggregates')
@Controller('aggregates')
export default class RestGlobalFactionCombatAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    @Get('global/faction')
    @ApiOperation({summary: 'Return a filtered list of GlobalFactionCombatAggregateEntity aggregates'})
    @ApiImplicitQueries(PAGINATION_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalFactionCombatAggregateEntity aggregates',
        type: GlobalFactionCombatAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('bracket', MandatoryIntPipe) bracket?: Bracket,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalFactionCombatAggregateEntity[]> {
        const pagination = new Pagination({sortBy, order, page, pageSize}, true);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const key = `/global/faction/W:${world}-B:${bracket}?P:${pagination.getKey()}`;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            await this.mongoOperationsService.findMany(GlobalFactionCombatAggregateEntity, {world, bracket}, pagination),
            900);
    }

    @Get('global/faction/:world')
    @ApiOperation({summary: 'Returns a GlobalFactionCombatAggregateEntity aggregate with given world'})
    @ApiImplicitQuery(WORLD_IMPLICIT_QUERY)
    @ApiResponse({
        status: 200,
        description: 'The GlobalFactionCombatAggregateEntity aggregate',
        type: GlobalFactionCombatAggregateEntity,
    })
    async findOne(
        @Param('world', OptionalIntPipe) world: World,
            @Query('bracket', MandatoryIntPipe) bracket?: Bracket,
    ): Promise<GlobalFactionCombatAggregateEntity> {
        return await this.mongoOperationsService.findOne(GlobalFactionCombatAggregateEntity, {world, bracket});
    }
}
