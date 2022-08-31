import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceFacilityControlAggregateEntity from '../../../../data/entities/aggregate/instance/instance.facility.control.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import Pagination from '../../../../../services/mongo/pagination';
import {AGGREGATE_INSTANCE_COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {Ps2AlertsEventTypePipe} from '../../../pipes/Ps2AlertsEventTypePipe';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';
import {PS2ALERTS_EVENT_TYPE_QUERY} from '../../common/rest.ps2AlertsEventType.query';
import {INSTANCE_IMPLICIT_QUERY} from '../../common/rest.instance.query';

@ApiTags('Instance Facility Control Aggregates')
@Controller('aggregates')
export default class RestInstanceFacilityControlAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/facility')
    @ApiOperation({summary: 'Returns a list of InstanceFacilityControlAggregateEntity for an instance'})
    @ApiImplicitQueries(AGGREGATE_INSTANCE_COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceFacilityControlAggregateEntity aggregates',
        type: InstanceFacilityControlAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Param('instance') instance: string,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceFacilityControlAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceFacilityControlAggregateEntity, {instance, ps2AlertsEventType}, new Pagination({sortBy, order, page, pageSize}, false));
    }

    @Get('instance/:instance/facility/:facility')
    @ApiOperation({summary: 'Returns a InstanceFacilityControlAggregateEntity aggregate for an instance and specific facility'})
    @ApiImplicitQueries([INSTANCE_IMPLICIT_QUERY, PS2ALERTS_EVENT_TYPE_QUERY])
    @ApiResponse({
        status: 200,
        description: 'The InstanceFacilityControlAggregateEntity aggregate',
        type: InstanceFacilityControlAggregateEntity,
    })
    async findOne(
        @Param('instance') instance: string,
            @Param('facility', ParseIntPipe) facility: number,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
    ): Promise<InstanceFacilityControlAggregateEntity> {
        return await this.mongoOperationsService.findOne(InstanceFacilityControlAggregateEntity, {instance, 'facility.id': facility, ps2AlertsEventType});
    }
}
