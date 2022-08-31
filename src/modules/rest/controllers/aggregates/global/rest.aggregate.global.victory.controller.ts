import {Controller, Get, Inject, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalVictoryAggregate from '../../../../data/entities/aggregate/global/global.victory.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {World} from '../../../../data/ps2alerts-constants/world';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {Zone} from '../../../../data/ps2alerts-constants/zone';
import {Bracket} from '../../../../data/ps2alerts-constants/bracket';
import {WORLD_IMPLICIT_QUERY} from '../../common/rest.world.query';
import {ZONE_IMPLICIT_QUERY} from '../../common/rest.zone.query';
import {BRACKET_IMPLICIT_QUERY} from '../../common/rest.bracket.query';
import {OptionalDatePipe} from '../../../pipes/OptionalDatePipe';
import Range from '../../../../../services/mongo/range';
import {DATE_IMPLICIT_QUERIES} from '../../common/rest.date.query';
import {RedisCacheService} from '../../../../../services/cache/redis.cache.service';
import Pagination from '../../../../../services/mongo/pagination';
import {BaseGlobalAggregateController} from './BaseGlobalAggregateController';
import {PS2ALERTS_EVENT_TYPE_QUERY} from '../../common/rest.ps2AlertsEventType.query';
import {BracketPipe} from '../../../pipes/BracketPipe';
import {Ps2AlertsEventTypePipe} from '../../../pipes/Ps2AlertsEventTypePipe';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';

@ApiTags('Global Victory Aggregates')
@Controller('aggregates')
export default class RestGlobalVictoryAggregateController extends BaseGlobalAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {
        super();
    }

    @Get('global/victories')
    @ApiOperation({summary: 'Return a filtered list of GlobalVictoryAggregate aggregates'})
    @ApiImplicitQueries([
        WORLD_IMPLICIT_QUERY,
        ZONE_IMPLICIT_QUERY,
        BRACKET_IMPLICIT_QUERY,
        PS2ALERTS_EVENT_TYPE_QUERY,
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
            @Query('bracket', BracketPipe) bracket?: Bracket,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('dateFrom', OptionalDatePipe) dateFrom?: Date | undefined,
            @Query('dateTo', OptionalDatePipe) dateTo?: Date | undefined,
    ): Promise<GlobalVictoryAggregate[]> {
        bracket = this.correctBracket(bracket, ps2AlertsEventType);

        const filter = {
            world,
            zone,
            bracket,
            ps2AlertsEventType,
            date: new Range('date', dateFrom, dateTo).build(),
        };

        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const key = `/global/victories/W:${world}-Z:${zone}-B:${bracket}-ET:${ps2AlertsEventType}?DF:${dateFrom}-DT:${dateTo}`;
        const pagination = new Pagination({sortBy: 'date', order: 'desc'});

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            await this.mongoOperationsService.findMany(GlobalVictoryAggregate, filter, pagination),
            60,
        );
    }
}
