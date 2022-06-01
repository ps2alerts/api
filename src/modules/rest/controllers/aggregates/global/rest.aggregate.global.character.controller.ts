import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalCharacterAggregateEntity from '../../../../data/entities/aggregate/global/global.character.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {World} from '../../../../data/constants/world.consts';
import Pagination from '../../../../../services/mongo/pagination';
import {Bracket} from '../../../../data/constants/bracket.consts';
import {RedisCacheService} from '../../../../../services/cache/redis.cache.service';
import {MandatoryIntPipe} from '../../../pipes/MandatoryIntPipe';

@ApiTags('Global Character Aggregates')
@Controller('aggregates')
export default class RestGlobalCharacterAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    @Get('global/character')
    @ApiOperation({summary: 'Return a filtered list of GlobalCharacterAggregateEntity instances'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of matching GlobalCharacterAggregateEntity aggregates',
        type: GlobalCharacterAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
            @Query('bracket', MandatoryIntPipe) bracket?: Bracket,
    ): Promise<GlobalCharacterAggregateEntity[]> {
        const pagination = new Pagination({sortBy, order, page, pageSize}, true);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const key = `/global/character/W:${world}-B:${bracket}?P:${pagination.getKey()}`;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            await this.mongoOperationsService.findMany(GlobalCharacterAggregateEntity, {world, bracket}, pagination),
            900);
    }

    @Get('global/character/:character')
    @ApiOperation({summary: 'Returns a single GlobalCharacterAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalCharacterAggregateEntity aggregate',
        type: GlobalCharacterAggregateEntity,
    })
    async findOne(
        @Param('character') character: string,
            @Query('bracket', MandatoryIntPipe) bracket?: Bracket,
    ): Promise<GlobalCharacterAggregateEntity> {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const key = `/global/character/${character}/B:${bracket}`;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            await this.mongoOperationsService.findOne(GlobalCharacterAggregateEntity, {'character.id': character, bracket}),
            300);
    }
}
