import {Controller, Get, Inject, Param, Query, ParseIntPipe, Post, UseGuards, Body} from '@nestjs/common';
import {
    ApiBody,
    ApiCreatedResponse,
    ApiOperation,
    ApiResponse,
    ApiSecurity,
    ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import InstanceFacilityControlEntity from '../../data/entities/instance/instance.facilitycontrol.entity';
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';
import {OptionalIntPipe} from '../pipes/OptionalIntPipe';
import Pagination from '../../../services/mongo/pagination';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {PAGINATION_IMPLICIT_QUERIES} from './common/rest.pagination.queries';
import {CreateFacilityControlDto} from '../Dto/CreateFacilityControlDto';
import {AuthGuard} from '@nestjs/passport';
import {ObjectID} from 'typeorm';

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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

    @Post('facility')
    @ApiOperation({summary: 'INTERNAL: Store a InstanceFacilityControlEntity for an instance'})
    @ApiCreatedResponse({description: 'Record created'})
    @ApiUnauthorizedResponse({description: 'This is an internal PS2Alerts endpoint, you won\'t have access to this - ever.'})
    @ApiSecurity('basic')
    @UseGuards(AuthGuard('basic'))
    async createOne(
        @Body() entity: CreateFacilityControlDto,
    ): Promise<string> {
        const id = await this.mongoOperationsService.insertOne(InstanceFacilityControlEntity, entity);
        return id.toString();
    }

    @Post('facility/batch')
    @ApiOperation({summary: 'INTERNAL: Store many InstanceFacilityControlEntities for an instance'})
    @ApiCreatedResponse({description: 'Records created'})
    @ApiUnauthorizedResponse({description: 'This is an internal PS2Alerts endpoint, you won\'t have access to this - ever.'})
    @ApiSecurity('basic')
    @UseGuards(AuthGuard('basic'))
    @ApiBody({type: [CreateFacilityControlDto]})
    async createMany(
        @Body() entities: CreateFacilityControlDto[],
    ): Promise<ObjectID[]> {
        return await this.mongoOperationsService.insertMany(InstanceFacilityControlEntity, entities);
    }

    // @Patch('facility/:instance/:facility')
    // @ApiOperation({summary: 'INTERNAL: Store a InstanceFacilityControlEntity for an instance'})
    // @ApiAcceptedResponse({description: 'Record updated'})
    // @ApiUnauthorizedResponse({description: 'This is an internal PS2Alerts endpoint, you won\'t have access to this - ever.'})
    // @ApiSecurity('basic')
    // @UseGuards(AuthGuard('basic'))
    // async patchOne(
    //     @Body() entity: CreateFacilityControlDto,
    // ): Promise<string> {
    //     const id = await this.mongoOperationsService.upsert(InstanceFacilityControlEntity, entity);
    //     return id.toString();
    // }
}
