import {ClassSerializerInterceptor, Controller, Get, Inject, Param, Query, UseInterceptors} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceMetagameTerritoryEntity from '../../data/entities/instance/instance.metagame.territory.entity';
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';

@ApiTags('Instances')
@Controller('instances')
export class RestInstanceMetagameController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('/metagame')
    @ApiOperation({summary: 'Return a paginated list of metagame instances'})
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiResponse({
        status: 200,
        description: 'List of Metagame Instances',
        type: InstanceMetagameTerritoryEntity,
        isArray: true,
    })
    async findAll(@Query('world') world: string): Promise<InstanceMetagameTerritoryEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(InstanceMetagameTerritoryEntity, {world: parseInt(world, 10)})
            : await this.mongoOperationsService.findMany(InstanceMetagameTerritoryEntity);
    }

    @Get('/metagame/:instance')
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
}
