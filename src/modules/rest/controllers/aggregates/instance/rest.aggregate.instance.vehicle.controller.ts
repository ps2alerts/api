import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceVehicleAggregateEntity from '../../../../data/entities/aggregate/instance/instance.vehicle.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {Vehicle} from '../../../../data/ps2alerts-constants/vehicle';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import Pagination from '../../../../../services/mongo/pagination';
import {AGGREGATE_INSTANCE_COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {Ps2AlertsEventTypePipe} from '../../../pipes/Ps2AlertsEventTypePipe';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';

@ApiTags('Instance Vehicle Aggregates')
@Controller('aggregates')
export default class RestInstanceVehicleAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/vehicle')
    @ApiOperation({summary: 'Returns a list of InstanceVehicleAggregateEntity aggregates for an instance'})
    @ApiImplicitQueries(AGGREGATE_INSTANCE_COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceVehicleAggregateEntity aggregates',
        type: InstanceVehicleAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Param('instance') instance: string,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number): Promise<InstanceVehicleAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceVehicleAggregateEntity, {instance, ps2AlertsEventType}, new Pagination({sortBy, order, page, pageSize}, false));
    }

    @Get('instance/:instance/vehicle/:vehicle')
    @ApiOperation({summary: 'Returns a single InstanceVehicleAggregateEntity for an instance'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceVehicleAggregateEntity aggregate',
        type: InstanceVehicleAggregateEntity,
    })
    async findOne(
        @Param('instance') instance: string,
            @Param('vehicle', ParseIntPipe) vehicle: Vehicle,
    ): Promise<InstanceVehicleAggregateEntity> {
        return await this.mongoOperationsService.findOne(InstanceVehicleAggregateEntity, {instance, vehicle});
    }
}
