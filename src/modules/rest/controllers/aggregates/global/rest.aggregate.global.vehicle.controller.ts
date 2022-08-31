import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalVehicleAggregateEntity from '../../../../data/entities/aggregate/global/global.vehicle.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {Vehicle} from '../../../../data/ps2alerts-constants/vehicle';
import {World} from '../../../../data/ps2alerts-constants/world';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {AGGREGATE_GLOBAL_COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import Pagination from '../../../../../services/mongo/pagination';
import {Bracket} from '../../../../data/ps2alerts-constants/bracket';
import {RedisCacheService} from '../../../../../services/cache/redis.cache.service';
import {BaseGlobalAggregateController} from './BaseGlobalAggregateController';
import {BracketPipe} from '../../../pipes/BracketPipe';
import {Ps2AlertsEventTypePipe} from '../../../pipes/Ps2AlertsEventTypePipe';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';

@ApiTags('Global Vehicle Aggregates')
@Controller('aggregates')
export default class RestGlobalVehicleAggregateController extends BaseGlobalAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {
        super();
    }

    @Get('global/vehicle')
    @ApiOperation({summary: 'Return a filtered list of GlobalVehicleAggregateEntity aggregates'})
    @ApiImplicitQueries(AGGREGATE_GLOBAL_COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalVehicleAggregateEntity aggregates',
        type: GlobalVehicleAggregateEntity,
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
    ): Promise<GlobalVehicleAggregateEntity[]> {
        bracket = this.correctBracket(bracket, ps2AlertsEventType);

        const pagination = new Pagination({sortBy, order, page, pageSize}, false);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const key = `/global/vehicle/W:${world}-B:${bracket}:ET${ps2AlertsEventType}?P:${pagination.getKey()}`;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            await this.mongoOperationsService.findMany(GlobalVehicleAggregateEntity, {world, bracket, ps2AlertsEventType}, pagination),
            900);
    }

    @Get('global/vehicle/:vehicle')
    @ApiOperation({summary: 'Returns GlobalVehicleAggregateEntity aggregate(s) with given Id (or one of each world)'})
    @ApiImplicitQueries(AGGREGATE_GLOBAL_COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The GlobalVehicleAggregateEntity aggregate(s)',
        type: GlobalVehicleAggregateEntity,
    })
    async findOne(
        @Param('vehicle', ParseIntPipe) vehicle: Vehicle,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('bracket', BracketPipe) bracket?: Bracket,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalVehicleAggregateEntity | GlobalVehicleAggregateEntity[]> {
        bracket = this.correctBracket(bracket, ps2AlertsEventType);

        return world
            ? await this.mongoOperationsService.findOne(GlobalVehicleAggregateEntity, {world, vehicle, bracket, ps2AlertsEventType})
            : await this.mongoOperationsService.findMany(GlobalVehicleAggregateEntity, {vehicle, bracket, ps2AlertsEventType}, new Pagination({sortBy, order, page, pageSize}, false));
    }
}
