import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {PAGINATION_IMPLICIT_QUERIES} from '../../common/rest.pagination.queries';
import Pagination from '../../../../../services/mongo/pagination';
import InstancePopulationAveragesAggregateEntity
    from '../../../../data/entities/aggregate/instance/instance.population.averages.aggregate.entity';

@ApiTags('Instance Population Average Aggregates')
@Controller('aggregates')
export default class RestInstancePopulationAggregateAveragesController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/population/averages')
    @ApiOperation({summary: 'Returns a list of InstancePopulationAveragesAggregateEntity for an instance'})
    @ApiImplicitQueries(PAGINATION_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of InstancePopulationAveragesAggregateEntity aggregates',
        type: InstancePopulationAveragesAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Param('instance') instance: string,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstancePopulationAveragesAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstancePopulationAveragesAggregateEntity, {instance}, new Pagination({sortBy, order, page, pageSize}, 'instance'));
    }
}
