import {Controller, Get, Inject, Param, Query, ParseIntPipe} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceFacilityControlEntity from '../../data/entities/instance/instance.facilitycontrol.entity';
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';
import {OptionalIntPipe} from '../pipes/OptionalIntPipe';
import Pagination from '../../../services/mongo/pagination';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {PAGINATION_IMPLICIT_QUERIES} from './common/rest.pagination.queries';
import {OptionalBoolPipe} from '../pipes/OptionalBoolPipe';

@ApiTags('Instance Facility Control Entries')
@Controller('instance-entries')
export default class RestInstanceFacilityControlController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get(':instance/facility')
    @ApiOperation({summary: 'Returns a list of InstanceFacilityControlEntity for an instance'})
    @ApiImplicitQueries([...PAGINATION_IMPLICIT_QUERIES, {
        name: 'noDefences',
        required: false,
        type: Boolean,
    }])
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceFacilityControlEntity for an instance',
        type: InstanceFacilityControlEntity,
        isArray: true,
    })
    async findAll(
        @Param('instance') instance: string,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
            @Query('noDefences', OptionalBoolPipe) noDefences?: boolean,
    ): Promise<InstanceFacilityControlEntity[]> {
        const filter = {instance} as {instance: string, isDefence?: boolean};

        if (noDefences) {
            filter.isDefence = false;
        }

        return await this.mongoOperationsService.findMany(InstanceFacilityControlEntity, filter, new Pagination({sortBy, order, page, pageSize}, false));
    }

    @Get(':instance/facility/:facility')
    @ApiOperation({summary: 'Return a single InstanceFacilityControlEntity of an instance'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceFacilityControlEntity instance',
        type: InstanceFacilityControlEntity,
    })
    async findOne(
        @Param('instance') instance: string,
            @Param('facility', ParseIntPipe) facility: number,
    ): Promise<InstanceFacilityControlEntity> {
        return await this.mongoOperationsService.findOne(InstanceFacilityControlEntity, {instance, facility});
    }
}
