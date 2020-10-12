import {ClassSerializerInterceptor, Controller, Get, Inject, Param, Query, UseInterceptors} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceMetagameTerritoryEntity from '../../data/entities/instance/instance.metagame.territory.entity';
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';
import {Ps2alertsEventState} from '../../data/constants/eventstate.consts';

@ApiTags('Instances')
@Controller('instances')
export class RestInstanceMetagameController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('/:instance')
    @ApiOperation({summary: 'Returns a single metagame instance'})
    @ApiResponse({
        status: 200,
        description: 'The Metagame Instance',
        type: InstanceMetagameTerritoryEntity,
    })
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(@Param('instance') instance: string): Promise<InstanceMetagameTerritoryEntity> {
        return await this.mongoOperationsService.findOne(InstanceMetagameTerritoryEntity, {instance});
    }

    @Get('/active')
    @ApiOperation({summary: 'Returns all currently running metagame instances, optionally requested by world'})
    @ApiResponse({
        status: 200,
        description: 'A list of active metagame instances',
        type: InstanceMetagameTerritoryEntity,
        isArray: true,
    })
    @UseInterceptors(ClassSerializerInterceptor)
    async findActives(@Query('world') world: string): Promise<InstanceMetagameTerritoryEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(InstanceMetagameTerritoryEntity, {world: parseInt(world, 10), state: Ps2alertsEventState.STARTED})
            : await this.mongoOperationsService.findMany(InstanceMetagameTerritoryEntity, {state: Ps2alertsEventState.STARTED});
    }

    @Get('/territory-control')
    @ApiOperation({summary: 'Return a paginated list of metagame territory control instances, optionally requested by world'})
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiResponse({
        status: 200,
        description: 'List of MetagameTerritory Instances',
        type: InstanceMetagameTerritoryEntity,
        isArray: true,
    })
    async findAll(@Query('world') world: string): Promise<InstanceMetagameTerritoryEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(InstanceMetagameTerritoryEntity, {world: parseInt(world, 10)})
            : await this.mongoOperationsService.findMany(InstanceMetagameTerritoryEntity);
    }

}
