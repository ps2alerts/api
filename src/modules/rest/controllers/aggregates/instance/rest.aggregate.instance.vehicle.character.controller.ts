import {Controller, Get, Inject, Param} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceVehicleCharacterAggregateEntity from '../../../../data/entities/aggregate/instance/instance.vehicle.character.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('Instance Vehicle Character Aggregates')
@Controller('aggregates')
export default class RestInstanceVehicleCharacterController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/vehicle/character')
    @ApiOperation({summary: 'Returns a list of InstanceVehicleCharacterAggregateEntity aggregates for an instance'})
    @ApiResponse({
        status: 200,
        description: 'A list of InstanceVehicleCharacterAggregateEntity aggregates',
        type: InstanceVehicleCharacterAggregateEntity,
        isArray: true,
    })
    async findAll(@Param('instance') instance: string): Promise<InstanceVehicleCharacterAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceVehicleCharacterAggregateEntity, {instance});
    }

    @Get('instance/:instance/vehicle/character/:character')
    @ApiOperation({summary: 'Returns a list of InstanceVehicleCharacterAggregateEntity aggregates for an instance and character'})
    @ApiResponse({
        status: 200,
        description: 'A list of InstanceVehicleCharacterAggregateEntity aggregates for a character',
        type: InstanceVehicleCharacterAggregateEntity,
        isArray: true,
    })
    async findCharacter(
        @Param('instance') instance: string,
            @Param('character') character: string,
    ): Promise<InstanceVehicleCharacterAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceVehicleCharacterAggregateEntity, {instance, character});
    }

    @Get('instance/:instance/vehicle/character/:character/:vehicle')
    @ApiOperation({summary: 'Returns a single InstanceVehicleCharacterAggregateEntity for an instance, character and particular vehicle'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceVehicleCharacterAggregateEntity aggregate for a character and vehicle',
        type: InstanceVehicleCharacterAggregateEntity,
    })
    async findCharacterVehicle(
        @Param('instance') instance: string,
            @Param('vehicle') vehicle: string,
            @Param('character') character: string,
    ): Promise<InstanceVehicleCharacterAggregateEntity> {
        return await this.mongoOperationsService.findOne(InstanceVehicleCharacterAggregateEntity, {instance, character, vehicle});
    }
}
