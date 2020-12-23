import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceLoadoutAggregateEntity from '../../../../data/entities/aggregate/instance/instance.loadout.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {Loadout} from '../../../../data/constants/loadout.consts';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {PAGINATION_IMPLICIT_QUERIES} from '../../common/rest.pagination.queries';
import Pagination from '../../../../../services/mongo/pagination';

@ApiTags('Instance Loadout Aggregates')
@Controller('aggregates')
export default class RestInstanceLoadoutAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/loadout')
    @ApiOperation({summary: 'Returns a list of InstanceLoadoutAggregateEntity for an instance'})
    @ApiImplicitQueries(PAGINATION_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceLoadoutAggregateEntity aggregates',
        type: InstanceLoadoutAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Param('instance') instance: string,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceLoadoutAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceLoadoutAggregateEntity, {instance}, new Pagination({sortBy, order, page, pageSize}, 'instance'));
    }

    // Note we use loadout here because loadout is a NodeJS reserved name and TS gets confused
    @Get('instance/:instance/loadout/:loadout')
    @ApiOperation({summary: 'Returns a specific loadout of InstanceLoadoutAggregateEntity aggregates within an instance'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceLoadoutAggregateEntity aggregate',
        type: InstanceLoadoutAggregateEntity,
    })
    async findOne(
        @Param('instance') instance: string,
            @Param('loadout', ParseIntPipe) loadout: Loadout,
    ): Promise<InstanceLoadoutAggregateEntity> {
        return await this.mongoOperationsService.findOne(InstanceLoadoutAggregateEntity, {instance, loadout});
    }
}
