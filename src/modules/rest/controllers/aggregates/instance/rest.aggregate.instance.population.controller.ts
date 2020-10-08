import {Controller, Get, Inject, Param} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstancePopulationAggregateEntity from '../../../../data/entities/aggregate/instance/instance.population.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('Instance Population Aggregates')
@Controller('aggregates')
export default class RestInstancePopulationAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/population')
    @ApiOperation({summary: 'Returns a list of InstancePopulationAggregateEntity for an instance'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstancePopulationAggregateEntity aggregates',
        type: InstancePopulationAggregateEntity,
        isArray: true,
    })
    async findAll(@Param('instance') instance: string): Promise<InstancePopulationAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstancePopulationAggregateEntity, {instance});
    }
}
