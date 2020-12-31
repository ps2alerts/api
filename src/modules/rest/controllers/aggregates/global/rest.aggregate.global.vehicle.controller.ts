import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalVehicleAggregateEntity from '../../../../data/entities/aggregate/global/global.vehicle.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {Vehicle} from '../../../../data/constants/vehicle.consts';
import {World} from '../../../../data/constants/world.consts';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import Pagination from '../../../../../services/mongo/pagination';

@ApiTags('Global Vehicle Aggregates')
@Controller('aggregates')
export default class RestGlobalVehicleAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/vehicle')
    @ApiOperation({summary: 'Return a filtered list of GlobalVehicleAggregateEntity aggregates'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalVehicleAggregateEntity aggregates',
        type: GlobalVehicleAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalVehicleAggregateEntity[]> {
        return await this.mongoOperationsService.findMany(GlobalVehicleAggregateEntity, {world}, new Pagination({sortBy, order, page, pageSize}, true));
    }

    @Get('global/vehicle/:vehicle')
    @ApiOperation({summary: 'Returns GlobalVehicleAggregateEntity aggregate(s) with given Id (or one of each world)'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The GlobalVehicleAggregateEntity aggregate(s)',
        type: GlobalVehicleAggregateEntity,
    })
    async findOne(
        @Param('vehicle', ParseIntPipe) vehicle: Vehicle,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalVehicleAggregateEntity | GlobalVehicleAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalVehicleAggregateEntity, {vehicle, world})
            : await this.mongoOperationsService.findMany(GlobalVehicleAggregateEntity, {vehicle}, new Pagination({sortBy, order, page, pageSize}, true));
    }
}
