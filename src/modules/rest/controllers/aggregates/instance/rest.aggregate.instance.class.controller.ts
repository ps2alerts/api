import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceClassAggregateEntity from '../../../../data/entities/aggregate/instance/instance.class.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {Loadout} from '../../../../data/constants/loadout.consts';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {PAGINATION_IMPLICIT_QUERIES} from '../../common/rest.pagination.queries';
import Pagination from '../../../../../services/mongo/pagination';

@ApiTags('Instance Class Aggregates')
@Controller('aggregates')
export default class RestInstanceClassAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/class')
    @ApiOperation({summary: 'Returns a list of InstanceClassAggregateEntity for an instance'})
    @ApiImplicitQueries(PAGINATION_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceClassAggregateEntity aggregates',
        type: InstanceClassAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Param('instance') instance: string,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceClassAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceClassAggregateEntity, {instance}, new Pagination({sortBy, order, page, pageSize}));
    }

    // Note we use loadout here because class is a NodeJS reserved name and TS gets confused
    @Get('instance/:instance/class/:loadout')
    @ApiOperation({summary: 'Returns a specific class of InstanceClassAggregateEntity aggregates within an instance'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceClassAggregateEntity aggregate',
        type: InstanceClassAggregateEntity,
    })
    async findOne(
        @Param('instance') instance: string,
            @Param('loadout', ParseIntPipe) loadout: Loadout,
    ): Promise<InstanceClassAggregateEntity> {
        return await this.mongoOperationsService.findOne(InstanceClassAggregateEntity, {instance, class: loadout});
    }
}
