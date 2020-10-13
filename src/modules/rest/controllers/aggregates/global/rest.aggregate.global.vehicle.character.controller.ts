import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalVehicleCharacterAggregateEntity from '../../../../data/entities/aggregate/global/global.vehicle.character.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {Vehicle} from '../../../../data/constants/vehicle.consts';
import {World} from '../../../../data/constants/world.consts';
import {NullableIntPipe} from '../../../pipes/NullableIntPipe';
import {ApiImplicitQuery} from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import {WORLD_IMPLICIT_QUERY} from '../../common/rest.world.query';

@ApiTags('Global Vehicle Character Aggregates')
@Controller('aggregates')
export default class RestGlobalVehicleCharacterController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/vehicle/character')
    @ApiOperation({summary: 'Returns a list of GlobalVehicleCharacterAggregateEntity aggregates for a world'})
    @ApiImplicitQuery(WORLD_IMPLICIT_QUERY)
    @ApiResponse({
        status: 200,
        description: 'A list of GlobalVehicleCharacterAggregateEntity aggregates',
        type: GlobalVehicleCharacterAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world', NullableIntPipe) world?: World): Promise<GlobalVehicleCharacterAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(GlobalVehicleCharacterAggregateEntity, {world})
            : await this.mongoOperationsService.findMany(GlobalVehicleCharacterAggregateEntity);
    }

    @Get('global/vehicle/character/:character')
    @ApiOperation({summary: 'Returns GlobalVehicleCharacterAggregateEntity aggregate for a character'})
    @ApiImplicitQuery(WORLD_IMPLICIT_QUERY)
    @ApiResponse({
        status: 200,
        description: 'GlobalVehicleCharacterAggregateEntity aggregate for character',
        type: GlobalVehicleCharacterAggregateEntity,
        isArray: true,
    })
    async findOne(
        @Param('character') character: string,
            @Query('world', NullableIntPipe) world?: World,
    ): Promise<GlobalVehicleCharacterAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(GlobalVehicleCharacterAggregateEntity, {world, character})
            : await this.mongoOperationsService.findMany(GlobalVehicleCharacterAggregateEntity, {character});
    }

    @Get('global/vehicle/character/:character/:vehicle')
    @ApiOperation({summary: 'Returns GlobalVehicleCharacterAggregateEntity aggregate for a character and a specific vehicle'})
    @ApiImplicitQuery(WORLD_IMPLICIT_QUERY)
    @ApiResponse({
        status: 200,
        description: 'GlobalVehicleCharacterAggregateEntity aggregate for character an vehicle',
        type: GlobalVehicleCharacterAggregateEntity,
        isArray: true,
    })
    async findOneByVehicle(
        @Param('character') character: string,
            @Param('vehicle', ParseIntPipe) vehicle: Vehicle,
            @Query('world', NullableIntPipe) world?: World,
    ): Promise<GlobalVehicleCharacterAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalVehicleCharacterAggregateEntity, {world, character, vehicle})
            : await this.mongoOperationsService.findMany(GlobalVehicleCharacterAggregateEntity, {character, vehicle});
    }
}
