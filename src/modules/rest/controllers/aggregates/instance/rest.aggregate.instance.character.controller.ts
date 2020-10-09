import {Controller, Get, Inject, Param} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceCharacterAggregateEntity from '../../../../data/entities/aggregate/instance/instance.character.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('Instance Character Aggregates')
@Controller('aggregates')
export default class RestInstanceCharacterAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/character')
    @ApiOperation({summary: 'Returns a list of InstanceCharacterAggregateEntity for an instance'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceCharacterAggregateEntity aggregates',
        type: InstanceCharacterAggregateEntity,
        isArray: true,
    })
    async findAll(@Param('instance') instance: string): Promise<InstanceCharacterAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceCharacterAggregateEntity, {instance});
    }

    @Get('instance/:instance/character/:character')
    @ApiOperation({summary: 'Returns a single InstanceCharacterAggregateEntity for an instance'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceCharacterAggregateEntity Instance',
        type: InstanceCharacterAggregateEntity,
    })
    async findOne(@Param('instance') instance: string, @Param('character') character: string): Promise<InstanceCharacterAggregateEntity | InstanceCharacterAggregateEntity[]> {
        return await this.mongoOperationsService.findOne(InstanceCharacterAggregateEntity, {instance, character});
    }
}
