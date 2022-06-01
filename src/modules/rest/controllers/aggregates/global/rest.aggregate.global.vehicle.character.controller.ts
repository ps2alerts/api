import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalVehicleCharacterAggregateEntity from '../../../../data/entities/aggregate/global/global.vehicle.character.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {Vehicle} from '../../../../data/constants/vehicle.consts';
import {World} from '../../../../data/constants/world.consts';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import Pagination from '../../../../../services/mongo/pagination';
import {Bracket} from '../../../../data/constants/bracket.consts';
import {MandatoryIntPipe} from '../../../pipes/MandatoryIntPipe';

@ApiTags('Global Vehicle Character Aggregates')
@Controller('aggregates')
export default class RestGlobalVehicleCharacterController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/vehicle/character')
    @ApiOperation({summary: 'Returns a list of GlobalVehicleCharacterAggregateEntity aggregates for a world'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'A list of GlobalVehicleCharacterAggregateEntity aggregates',
        type: GlobalVehicleCharacterAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
            @Query('bracket', MandatoryIntPipe) bracket?: Bracket,
    ): Promise<GlobalVehicleCharacterAggregateEntity[]> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.mongoOperationsService.findMany(GlobalVehicleCharacterAggregateEntity, {world, bracket}, new Pagination({sortBy, order, page, pageSize}, true));
    }

    @Get('global/vehicle/character/:character')
    @ApiOperation({summary: 'Returns GlobalVehicleCharacterAggregateEntity aggregate for a character'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'GlobalVehicleCharacterAggregateEntity aggregate for character',
        type: GlobalVehicleCharacterAggregateEntity,
        isArray: true,
    })
    async findOne(
        @Param('character') character: string,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
            @Query('bracket', MandatoryIntPipe) bracket?: Bracket,
    ): Promise<GlobalVehicleCharacterAggregateEntity[]> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.mongoOperationsService.findMany(GlobalVehicleCharacterAggregateEntity, {world, character, bracket}, new Pagination({sortBy, order, page, pageSize}, true));
    }

    @Get('global/vehicle/character/:character/:vehicle')
    @ApiOperation({summary: 'Returns GlobalVehicleCharacterAggregateEntity aggregate for a character and a specific vehicle'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'GlobalVehicleCharacterAggregateEntity aggregate for character an vehicle',
        type: GlobalVehicleCharacterAggregateEntity,
        isArray: true,
    })
    async findOneByVehicle(
        @Param('character') character: string,
            @Param('vehicle', ParseIntPipe) vehicle: Vehicle,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
            @Query('bracket', MandatoryIntPipe) bracket?: Bracket,
    ): Promise<GlobalVehicleCharacterAggregateEntity | GlobalVehicleCharacterAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalVehicleCharacterAggregateEntity, {world, character, vehicle, bracket})
            : await this.mongoOperationsService.findMany(GlobalVehicleCharacterAggregateEntity, {character, vehicle, bracket}, new Pagination({sortBy, order, page, pageSize}, false));
    }
}
