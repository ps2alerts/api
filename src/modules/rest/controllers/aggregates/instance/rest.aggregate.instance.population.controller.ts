import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import RestBaseController from '../../rest.base.controller';
import InstancePopulationAggregateEntity from '../../../../data/entities/aggregate/instance/instance.population.aggregate.entity';

@ApiTags('instance_population_aggregate')
@Controller('aggregates')
export default class RestInstancePopulationAggregateController extends RestBaseController<InstancePopulationAggregateEntity>{

    constructor(
    @InjectRepository(InstancePopulationAggregateEntity) repository: Repository<InstancePopulationAggregateEntity>,
    ) {
        super(repository);
    }

    @Get('instance/population')
    @ApiOperation({summary: 'Return a filtered list of InstancePopulationAggregateEntity instances'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstancePopulationAggregateEntity aggregates',
        type: InstancePopulationAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('instance') instanceQuery?: string): Promise<InstancePopulationAggregateEntity[]> {
        return await instanceQuery ? this.findEntities({instance: instanceQuery}) : this.findEntities();
    }

    @Get('instance/population/:id')
    @ApiOperation({summary: 'Returns a single InstancePopulationAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The InstancePopulationAggregateEntity Instance',
        type: InstancePopulationAggregateEntity,
    })
    async findOne(@Param('id') id: Date, @Query('instance') instanceQuery?: string): Promise<InstancePopulationAggregateEntity | InstancePopulationAggregateEntity[]> {
        return await instanceQuery ? this.findEntity({timestamp: id, instance: instanceQuery}) : this.findEntitiesById('population', id);
    }
}
