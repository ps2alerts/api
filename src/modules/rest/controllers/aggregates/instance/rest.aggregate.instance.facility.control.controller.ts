import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceFacilityControlAggregateEntity from '../../../../data/entities/aggregate/instance/instance.facility.control.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {PAGINATION_IMPLICIT_QUERIES} from '../../common/rest.pagination.queries';
import Pagination from '../../../../../services/mongo/pagination';

@ApiTags('Instance Facility Control Aggregates')
@Controller('aggregates')
export default class RestInstanceFacilityControlAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/facility')
    @ApiOperation({summary: 'Returns a list of InstanceFacilityControlAggregateEntity for an instance'})
    @ApiImplicitQueries(PAGINATION_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceFacilityControlAggregateEntity aggregates',
        type: InstanceFacilityControlAggregateEntity,
        isArray: true,
    })
    async findAll(@Param('instance') instance: string,
        @Query('sortBy') sortBy?: string,
        @Query('order') order?: string,
        @Query('page', OptionalIntPipe) page?: number,
        @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceFacilityControlAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceFacilityControlAggregateEntity, {instance}, new Pagination({sortBy, order, page, pageSize}));
    }

    @Get('instance/:instance/facility/:facility')
    @ApiOperation({summary: 'Returns a InstanceFacilityControlAggregateEntity aggregate for an instance and specific facility'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceFacilityControlAggregateEntity aggregate',
        type: InstanceFacilityControlAggregateEntity,
    })
    async findOne(
        @Param('instance') instance: string,
            @Param('facility', ParseIntPipe) facility: number,
    ): Promise<InstanceFacilityControlAggregateEntity> {
        return await this.mongoOperationsService.findOne(InstanceFacilityControlAggregateEntity, {instance, facility});
    }
}
