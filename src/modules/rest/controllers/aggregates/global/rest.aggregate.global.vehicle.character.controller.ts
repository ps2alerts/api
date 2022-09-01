import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalVehicleCharacterAggregateEntity from '../../../../data/entities/aggregate/global/global.vehicle.character.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {Vehicle} from '../../../../data/ps2alerts-constants/vehicle';
import {World} from '../../../../data/ps2alerts-constants/world';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {AGGREGATE_GLOBAL_COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import Pagination from '../../../../../services/mongo/pagination';
import {Bracket} from '../../../../data/ps2alerts-constants/bracket';
import {BaseGlobalAggregateController} from './BaseGlobalAggregateController';
import {BracketPipe} from '../../../pipes/BracketPipe';
import {Ps2AlertsEventTypePipe} from '../../../pipes/Ps2AlertsEventTypePipe';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';

@ApiTags('Global Vehicle Character Aggregates')
@Controller('aggregates')
export default class RestGlobalVehicleCharacterController extends BaseGlobalAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {
        super();
    }

    @Get('global/vehicle/character')
    @ApiOperation({summary: 'Returns a list of GlobalVehicleCharacterAggregateEntity aggregates for a world'})
    @ApiImplicitQueries(AGGREGATE_GLOBAL_COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'A list of GlobalVehicleCharacterAggregateEntity aggregates',
        type: GlobalVehicleCharacterAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('bracket', BracketPipe) bracket?: Bracket,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalVehicleCharacterAggregateEntity[]> {
        bracket = this.correctBracket(bracket, ps2AlertsEventType);

        return await this.mongoOperationsService.findMany(GlobalVehicleCharacterAggregateEntity, {world, bracket, ps2AlertsEventType}, new Pagination({sortBy, order, page, pageSize}, true));
    }

    @Get('global/vehicle/character/:character')
    @ApiOperation({summary: 'Returns GlobalVehicleCharacterAggregateEntity aggregate for a character'})
    @ApiImplicitQueries(AGGREGATE_GLOBAL_COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'GlobalVehicleCharacterAggregateEntity aggregate for character',
        type: GlobalVehicleCharacterAggregateEntity,
        isArray: true,
    })
    async findOne(
        @Param('character') character: string,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('bracket', BracketPipe) bracket?: Bracket,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalVehicleCharacterAggregateEntity[]> {
        bracket = this.correctBracket(bracket, ps2AlertsEventType);

        return await this.mongoOperationsService.findMany(GlobalVehicleCharacterAggregateEntity, {world, character, bracket, ps2AlertsEventType}, new Pagination({sortBy, order, page, pageSize}, true));
    }

    @Get('global/vehicle/character/:character/:vehicle')
    @ApiOperation({summary: 'Returns GlobalVehicleCharacterAggregateEntity aggregate for a character and a specific vehicle'})
    @ApiImplicitQueries(AGGREGATE_GLOBAL_COMMON_IMPLICIT_QUERIES)
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
            @Query('bracket', BracketPipe) bracket?: Bracket,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalVehicleCharacterAggregateEntity | GlobalVehicleCharacterAggregateEntity[]> {
        bracket = this.correctBracket(bracket, ps2AlertsEventType);

        return world
            ? await this.mongoOperationsService.findOne(GlobalVehicleCharacterAggregateEntity, {world, character, vehicle, bracket, ps2AlertsEventType})
            : await this.mongoOperationsService.findMany(GlobalVehicleCharacterAggregateEntity, {character, vehicle, bracket, ps2AlertsEventType}, new Pagination({sortBy, order, page, pageSize}, false));
    }
}
