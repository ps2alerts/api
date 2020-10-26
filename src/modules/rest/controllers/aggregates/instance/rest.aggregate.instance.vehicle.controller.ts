import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceVehicleAggregateEntity from '../../../../data/entities/aggregate/instance/instance.vehicle.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {Vehicle} from '../../../../data/constants/vehicle.consts';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {PAGINATION_IMPLICIT_QUERIES} from '../../common/rest.pagination.queries';
import Pagination from '../../../../../services/mongo/pagination';

@ApiTags('Instance Vehicle Aggregates')
@Controller('aggregates')
export default class RestInstanceVehicleAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/vehicle')
    @ApiOperation({summary: 'Returns a list of InstanceVehicleAggregateEntity aggregates for an instance'})
    @ApiImplicitQueries(PAGINATION_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceVehicleAggregateEntity aggregates',
        type: InstanceVehicleAggregateEntity,
        isArray: true,
    })
    async findAll(@Param('instance') instance: string,

        @Query('sortBy') sortBy?: string,
        @Query('order') order?: string,
        @Query('page', OptionalIntPipe) page?: number,
        @Query('pageSize', OptionalIntPipe) pageSize?: number): Promise<InstanceVehicleAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceVehicleAggregateEntity, {instance}, new Pagination({sortBy, order, page, pageSize}));
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
        return await this.mongoOperationsService.findOne(InstanceVehicleAggregateEntity, {vehicle});
    }
}
