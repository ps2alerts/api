import {Controller, Get, Inject, Param, ParseIntPipe} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceVehicleAggregateEntity from '../../../../data/entities/aggregate/instance/instance.vehicle.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {Vehicle} from '../../../../data/constants/vehicle.consts';

@ApiTags('Instance Vehicle Aggregates')
@Controller('aggregates')
export default class RestInstanceVehicleAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/vehicle')
    @ApiOperation({summary: 'Returns a list of InstanceVehicleAggregateEntity aggregates for an instance'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceVehicleAggregateEntity aggregates',
        type: InstanceVehicleAggregateEntity,
        isArray: true,
    })
    async findAll(@Param('instance') instance: string): Promise<InstanceVehicleAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceVehicleAggregateEntity, {instance});
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
