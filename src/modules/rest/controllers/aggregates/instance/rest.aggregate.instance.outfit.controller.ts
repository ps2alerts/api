import {Controller, Get, Inject, Param} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceOutfitAggregateEntity from '../../../../data/entities/aggregate/instance/instance.outfit.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('Instance Outfit Aggregates')
@Controller('aggregates')
export default class RestInstanceOutfitAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/outfit')
    @ApiOperation({summary: 'Returns a list of InstanceOutfitAggregateEntity for an instance'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceOutfitAggregateEntity aggregates',
        type: InstanceOutfitAggregateEntity,
        isArray: true,
    })
    async findAll(@Param('instance') instance: string): Promise<InstanceOutfitAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceOutfitAggregateEntity, {instance});
    }

    @Get('instance/:instance/outfit/:outfit')
    @ApiOperation({summary: 'Returns a InstanceOutfitAggregateEntity aggregate with given id within an instance'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceOutfitAggregateEntity aggregate',
        type: InstanceOutfitAggregateEntity,
    })
    async findOne(@Param('instance') instance: string, @Param('outfit') outfit: string): Promise<InstanceOutfitAggregateEntity> {
        return this.mongoOperationsService.findOne(InstanceOutfitAggregateEntity, {instance, outfit});
    }
}
