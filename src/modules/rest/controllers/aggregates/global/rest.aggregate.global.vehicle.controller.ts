import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalVehicleAggregateEntity from '../../../../data/entities/aggregate/global/global.vehicle.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {Vehicle} from '../../../../data/constants/vehicle.consts';
import {World} from '../../../../data/constants/world.consts';

@ApiTags('Global Vehicle Aggregates')
@Controller('aggregates')
export default class RestGlobalVehicleAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/vehicle')
    @ApiOperation({summary: 'Return a filtered list of GlobalVehicleAggregateEntity aggregates'})
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalVehicleAggregateEntity aggregates',
        type: GlobalVehicleAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world', ParseIntPipe) world?: World): Promise<GlobalVehicleAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(GlobalVehicleAggregateEntity, {world})
            : await this.mongoOperationsService.findMany(GlobalVehicleAggregateEntity);
    }

    @Get('global/vehicle/:vehicle')
    @ApiOperation({summary: 'Returns GlobalVehicleAggregateEntity aggregate(s) with given Id (or one of each world)'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalVehicleAggregateEntity aggregate(s)',
        type: GlobalVehicleAggregateEntity,
    })
    async findOne(
        @Param('vehicle', ParseIntPipe) vehicle: Vehicle,
            @Query('world', ParseIntPipe) world?: World,
    ): Promise<GlobalVehicleAggregateEntity | GlobalVehicleAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalVehicleAggregateEntity, {vehicle, world})
            : await this.mongoOperationsService.findMany(GlobalVehicleAggregateEntity, {vehicle});
    }
}
