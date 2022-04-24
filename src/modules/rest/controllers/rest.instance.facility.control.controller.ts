import {
    Controller,
    Get,
    Inject,
    Param,
    Query,
    ParseIntPipe,
    Post,
    UseGuards,
    Body,
    Patch,
    HttpCode,
} from '@nestjs/common';
import {
    ApiBody,
    ApiCreatedResponse, ApiNoContentResponse,
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
import {OptionalBoolPipe} from '../pipes/OptionalBoolPipe';
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
            @Query('noDefences', OptionalBoolPipe) noDefences?: boolean | undefined,
    ): Promise<InstanceFacilityControlEntity[]> {
        const filter = {instance} as {instance: string, isDefence?: boolean};

        if (noDefences) {
            filter.isDefence = false;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.mongoOperationsService.findMany(InstanceFacilityControlEntity, filter, new Pagination({sortBy, order, page, pageSize}, false));
    }

    @Post(':instance/facility')
    @HttpCode(201)
    @ApiOperation({summary: 'INTERNAL: Store a InstanceFacilityControlEntity for an instance'})
    @ApiCreatedResponse({description: 'Record created'})
    @ApiUnauthorizedResponse({description: 'This is an internal PS2Alerts endpoint, you won\'t have access to this - ever.'})
    @ApiSecurity('basic')
    @UseGuards(AuthGuard('basic'))
    async createOne(
        @Param('instance') instance: string,
            @Body() entity: CreateFacilityControlDto,
    ): Promise<void> {
        await this.mongoOperationsService.insertOne(InstanceFacilityControlEntity, entity);
    }

    @Get(':instance/facility/:facility')
    @ApiOperation({summary: 'Returns the latest InstanceFacilityControlEntity of an instance'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceFacilityControlEntity instance',
        type: InstanceFacilityControlEntity,
    })
    async findOne(
        @Param('instance') instance: string,
            @Param('facility', ParseIntPipe) facility: number,
    ): Promise<InstanceFacilityControlEntity> {
        const pagination = new Pagination({sortBy: 'timestamp', order: 'desc'}, true);
        return await this.mongoOperationsService.findOne(InstanceFacilityControlEntity, {instance, facility}, pagination);
    }

    @Patch(':instance/facility/:facility')
    @HttpCode(204)
    @ApiOperation({summary: 'INTERNAL: Update a InstanceFacilityControlEntity for an instance, by latest record'})
    @ApiNoContentResponse({description: 'Record updated'})
    @ApiUnauthorizedResponse({description: 'This is an internal PS2Alerts endpoint, you won\'t have access to this - ever.'})
    @ApiSecurity('basic')
    @UseGuards(AuthGuard('basic'))
    async patchOne(
        @Param('instance') instance: string,
            @Param('facility', ParseIntPipe) facility: number,
            @Body() entity: CreateFacilityControlDto,
    ): Promise<void> {
        const record: InstanceFacilityControlEntity = await this.findOne(instance, facility);

        const updatedRecord = Object.assign(record, entity);

        // eslint-disable-next-line @typescript-eslint/naming-convention
        await this.mongoOperationsService.upsert(InstanceFacilityControlEntity, [{$set: updatedRecord}], [{_id: updatedRecord._id}]);
    }

    @Post('facility/batch')
    @HttpCode(202)
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
}
