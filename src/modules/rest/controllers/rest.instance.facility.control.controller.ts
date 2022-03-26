import {Controller, Get, Inject, Param, Query, ParseIntPipe, Post, UseGuards, Body} from '@nestjs/common';
import {ApiBasicAuth, ApiOperation, ApiResponse, ApiSecurity, ApiTags} from '@nestjs/swagger';
import InstanceFacilityControlEntity from '../../data/entities/instance/instance.facilitycontrol.entity';
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';
import {OptionalIntPipe} from '../pipes/OptionalIntPipe';
import Pagination from '../../../services/mongo/pagination';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {PAGINATION_IMPLICIT_QUERIES} from './common/rest.pagination.queries';
import {CreateFacilityControlDto} from '../Dto/CreateFacilityControlDto';
import {AuthGuard} from '@nestjs/passport';

@ApiTags('Instance Facility Control Entries')
@Controller('instance-entries')
export default class RestInstanceFacilityControlController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get(':instance/facility')
    @ApiOperation({summary: 'Returns a list of InstanceFacilityControlEntity for an instance'})
    @ApiImplicitQueries(PAGINATION_IMPLICIT_QUERIES)
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
    ): Promise<InstanceFacilityControlEntity[]> {
        return await this.mongoOperationsService.findMany(InstanceFacilityControlEntity, {instance}, new Pagination({sortBy, order, page, pageSize}, false));
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

    @Post(':instance/facility')
    @ApiOperation({summary: 'INTERNAL: Store a InstanceFacilityControlEntity for an instance'})
    @ApiResponse({
        status: 201,
        description: 'Successful creation of a InstanceFacilityControlEntity',
        type: InstanceFacilityControlEntity,
    })
    @ApiSecurity('basic')
    @ApiBasicAuth()
    @UseGuards(AuthGuard('basic'))
    createOne(
        @Body() createFacilityDto: CreateFacilityControlDto,
            @Param('instance') instance: string,
    ): boolean {
        return true;
    }
}
