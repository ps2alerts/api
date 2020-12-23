import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceOutfitAggregateEntity from '../../../../data/entities/aggregate/instance/instance.outfit.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {PAGINATION_IMPLICIT_QUERIES} from '../../common/rest.pagination.queries';
import Pagination from '../../../../../services/mongo/pagination';

@ApiTags('Instance Outfit Aggregates')
@Controller('aggregates')
export default class RestInstanceOutfitAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/outfit')
    @ApiOperation({summary: 'Returns a list of InstanceOutfitAggregateEntity for an instance'})
    @ApiImplicitQueries(PAGINATION_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceOutfitAggregateEntity aggregates',
        type: InstanceOutfitAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Param('instance') instance: string,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceOutfitAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceOutfitAggregateEntity, {instance}, new Pagination({sortBy, order, page, pageSize}, 'instance'));
    }

    @Get('instance/:instance/outfit/:outfit')
    @ApiOperation({summary: 'Returns a InstanceOutfitAggregateEntity aggregate with given id within an instance'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceOutfitAggregateEntity aggregate',
        type: InstanceOutfitAggregateEntity,
    })
    async findOne(
        @Param('instance') instance: string,
            @Param('outfit') outfit: string,
    ): Promise<InstanceOutfitAggregateEntity> {
        return this.mongoOperationsService.findOne(InstanceOutfitAggregateEntity, {instance, 'outfit.id': outfit});
    }

    @Get('instance/outfit/:outfit')
    @ApiOperation({summary: 'Returns a InstanceOutfitAggregateEntity aggregate for all instances'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceOutfitAggregateEntity aggregates by outfit ID',
        type: InstanceOutfitAggregateEntity,
        isArray: true,
    })
    async findByOutfitId(
        @Param('outfit') outfit: string,
    ): Promise<InstanceOutfitAggregateEntity[]> {
        return this.mongoOperationsService.findOne(InstanceOutfitAggregateEntity, {'outfit.id': outfit});
    }
}
