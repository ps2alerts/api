import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalVehicleAggregateEntity from '../../../../data/entities/aggregate/global/global.vehicle.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {Vehicle} from '../../../../data/constants/vehicle.consts';
import {World} from '../../../../data/constants/world.consts';
import {ApiImplicitQuery} from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import {WORLD_IMPLICIT_QUERY} from '../../common/rest.world.query';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPIpe';

@ApiTags('Global Vehicle Aggregates')
@Controller('aggregates')
export default class RestGlobalVehicleAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/vehicle')
    @ApiOperation({summary: 'Return a filtered list of GlobalVehicleAggregateEntity aggregates'})
    @ApiImplicitQuery(WORLD_IMPLICIT_QUERY)
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalVehicleAggregateEntity aggregates',
        type: GlobalVehicleAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world', OptionalIntPipe) world?: World): Promise<GlobalVehicleAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(GlobalVehicleAggregateEntity, {world})
            : await this.mongoOperationsService.findMany(GlobalVehicleAggregateEntity);
    }

    @Get('global/vehicle/:vehicle')
    @ApiOperation({summary: 'Returns GlobalVehicleAggregateEntity aggregate(s) with given Id (or one of each world)'})
    @ApiImplicitQuery(WORLD_IMPLICIT_QUERY)
    @ApiResponse({
        status: 200,
        description: 'The GlobalVehicleAggregateEntity aggregate(s)',
        type: GlobalVehicleAggregateEntity,
    })
    async findOne(
        @Param('vehicle', ParseIntPipe) vehicle: Vehicle,
            @Query('world', OptionalIntPipe) world?: World,
    ): Promise<GlobalVehicleAggregateEntity | GlobalVehicleAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalVehicleAggregateEntity, {vehicle, world})
            : await this.mongoOperationsService.findMany(GlobalVehicleAggregateEntity, {vehicle});
    }
}
