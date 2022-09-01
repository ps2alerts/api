import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceLoadoutAggregateEntity from '../../../../data/entities/aggregate/instance/instance.loadout.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {Loadout} from '../../../../data/ps2alerts-constants/loadout';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import Pagination from '../../../../../services/mongo/pagination';
import {AGGREGATE_INSTANCE_COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {Ps2AlertsEventTypePipe} from '../../../pipes/Ps2AlertsEventTypePipe';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';
import {INSTANCE_IMPLICIT_QUERY} from '../../common/rest.instance.query';
import {PS2ALERTS_EVENT_TYPE_QUERY} from '../../common/rest.ps2AlertsEventType.query';

@ApiTags('Instance Loadout Aggregates')
@Controller('aggregates')
export default class RestInstanceLoadoutAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/loadout')
    @ApiOperation({summary: 'Returns a list of InstanceLoadoutAggregateEntity for an instance'})
    @ApiImplicitQueries(AGGREGATE_INSTANCE_COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceLoadoutAggregateEntity aggregates',
        type: InstanceLoadoutAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Param('instance') instance: string,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceLoadoutAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceLoadoutAggregateEntity, {instance, ps2AlertsEventType}, new Pagination({sortBy, order, page, pageSize}, false));
    }

    // Note we use loadout here because loadout is a NodeJS reserved name and TS gets confused
    @Get('instance/:instance/loadout/:loadout')
    @ApiOperation({summary: 'Returns a specific loadout of InstanceLoadoutAggregateEntity aggregates within an instance'})
    @ApiImplicitQueries([INSTANCE_IMPLICIT_QUERY, PS2ALERTS_EVENT_TYPE_QUERY])
    @ApiResponse({
        status: 200,
        description: 'The InstanceLoadoutAggregateEntity aggregate',
        type: InstanceLoadoutAggregateEntity,
    })
    async findOne(
        @Param('instance') instance: string,
            @Param('loadout', ParseIntPipe) loadout: Loadout,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
    ): Promise<InstanceLoadoutAggregateEntity> {
        return await this.mongoOperationsService.findOne(InstanceLoadoutAggregateEntity, {instance, loadout, ps2AlertsEventType});
    }
}
