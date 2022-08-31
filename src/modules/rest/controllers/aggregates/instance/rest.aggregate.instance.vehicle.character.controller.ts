import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceVehicleCharacterAggregateEntity from '../../../../data/entities/aggregate/instance/instance.vehicle.character.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {Vehicle} from '../../../../data/ps2alerts-constants/vehicle';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {PAGINATION_IMPLICIT_QUERIES} from '../../common/rest.pagination.queries';
import Pagination from '../../../../../services/mongo/pagination';
import {AGGREGATE_INSTANCE_COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {Ps2AlertsEventTypePipe} from '../../../pipes/Ps2AlertsEventTypePipe';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';

@ApiTags('Instance Vehicle Character Aggregates')
@Controller('aggregates')
export default class RestInstanceVehicleCharacterController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/vehicle/character')
    @ApiOperation({summary: 'Returns a list of InstanceVehicleCharacterAggregateEntity aggregates for an instance'})
    @ApiImplicitQueries(AGGREGATE_INSTANCE_COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'A list of InstanceVehicleCharacterAggregateEntity aggregates',
        type: InstanceVehicleCharacterAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Param('instance') instance: string,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number): Promise<InstanceVehicleCharacterAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceVehicleCharacterAggregateEntity, {instance, ps2AlertsEventType}, new Pagination({sortBy, order, page, pageSize}, false));
    }

    @Get('instance/:instance/vehicle/character/:character')
    @ApiOperation({summary: 'Returns a list of InstanceVehicleCharacterAggregateEntity aggregates for an instance and character'})
    @ApiImplicitQueries(PAGINATION_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'A list of InstanceVehicleCharacterAggregateEntity aggregates for a character',
        type: InstanceVehicleCharacterAggregateEntity,
        isArray: true,
    })
    async findCharacter(
        @Param('instance') instance: string,
            @Param('character') character: string,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceVehicleCharacterAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceVehicleCharacterAggregateEntity, {instance, character}, new Pagination({sortBy, order, page, pageSize}, false));
    }

    @Get('instance/:instance/vehicle/character/:character/:vehicle')
    @ApiOperation({summary: 'Returns a single InstanceVehicleCharacterAggregateEntity for an instance, character and particular vehicle'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceVehicleCharacterAggregateEntity aggregate for a character and vehicle',
        type: InstanceVehicleCharacterAggregateEntity,
    })
    async findOneByVehicle(
        @Param('instance') instance: string,
            @Param('character') character: string,
            @Param('vehicle', ParseIntPipe) vehicle: Vehicle,
    ): Promise<InstanceVehicleCharacterAggregateEntity> {
        return await this.mongoOperationsService.findOne(InstanceVehicleCharacterAggregateEntity, {instance, character, vehicle});
    }
}
