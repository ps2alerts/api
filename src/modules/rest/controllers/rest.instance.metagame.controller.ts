import {ClassSerializerInterceptor, Controller, Get, Inject, Param, Query, UseInterceptors} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceMetagameEntity from '../../data/entities/instance/instance.metagame.entity';
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
        type: InstanceMetagameEntity,
        isArray: true,
    })
    async findAll(@Query('world') world: string): Promise<InstanceMetagameEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(InstanceMetagameEntity, {world: parseInt(world, 10)})
            : await this.mongoOperationsService.findMany(InstanceMetagameEntity);
    }

    @Get('/metagame/:instance')
    @ApiOperation({summary: 'Returns a single metagame instance'})
    @ApiResponse({
        status: 200,
        description: 'The Metagame Instance',
        type: InstanceMetagameEntity,
    })
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(@Param('instance') instance: string): Promise<InstanceMetagameEntity> {
        return await this.mongoOperationsService.findOne(InstanceMetagameEntity, {instance});
    }
}
