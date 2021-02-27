import {Controller, Get, Inject, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalVictoryAggregate from '../../../../data/entities/aggregate/global/global.victory.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {World} from '../../../../data/constants/world.consts';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {Zone} from '../../../../data/constants/zone.consts';
import {Bracket} from '../../../../data/constants/bracket.consts';
import {WORLD_IMPLICIT_QUERY} from '../../common/rest.world.query';
import {ZONE_IMPLICIT_QUERY} from '../../common/rest.zone.query';
import {BRACKET_IMPLICIT_QUERY} from '../../common/rest.bracket.query';
import {OptionalDatePipe} from '../../../pipes/OptionalDatePipe';
import Range from '../../../../../services/mongo/range';
import {DATE_IMPLICIT_QUERIES} from '../../common/rest.date.query';
import {RedisCacheService} from '../../../../../services/cache/redis.cache.service';

@ApiTags('Global Victory Aggregates')
@Controller('aggregates')
export default class RestGlobalVictoryAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    @Get('global/victories')
    @ApiOperation({summary: 'Return a filtered list of GlobalVictoryAggregate aggregates'})
    @ApiImplicitQueries([
        WORLD_IMPLICIT_QUERY,
        ZONE_IMPLICIT_QUERY,
        BRACKET_IMPLICIT_QUERY,
        ...DATE_IMPLICIT_QUERIES,
    ])
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalVictoryAggregate aggregates',
        type: GlobalVictoryAggregate,
        isArray: true,
    })
    async findAll(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('zone', OptionalIntPipe) zone?: Zone,
            @Query('bracket', OptionalIntPipe) bracket?: Bracket,
            @Query('dateFrom', OptionalDatePipe) dateFrom?: Date,
            @Query('dateTo', OptionalDatePipe) dateTo?: Date,
    ): Promise<GlobalVictoryAggregate[]> {
        const filter = {
            world,
            zone,
            bracket,
            date: new Range('date', dateFrom, dateTo).build(),
        };

        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const key = `/global/victories/W:${world}-Z:${zone}-B:${bracket}?DF:${dateFrom}-DT:${dateTo}`;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            await this.mongoOperationsService.findMany(GlobalVictoryAggregate, filter),
            60,
        );
    }
}
