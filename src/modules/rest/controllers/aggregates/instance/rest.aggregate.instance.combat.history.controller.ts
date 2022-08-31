import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import InstanceCombatHistoryAggregateEntity from '../../../../data/entities/aggregate/instance/instance.combat.history.aggregate.entity';
import Pagination from '../../../../../services/mongo/pagination';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {AGGREGATE_INSTANCE_COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {Ps2AlertsEventTypePipe} from '../../../pipes/Ps2AlertsEventTypePipe';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';

@ApiTags('Instance Combat History Aggregates')
@Controller('aggregates')
export default class RestInstanceCombatHistoryAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/combat-history')
    @ApiOperation({summary: 'Returns the InstanceCombatHistoryAggregateEntity for an instance'})
    @ApiImplicitQueries(AGGREGATE_INSTANCE_COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The InstanceCombatHistoryAggregateEntity aggregate',
        type: InstanceCombatHistoryAggregateEntity,
        isArray: true,
    })
    async findMany(
        @Param('instance') instance: string,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceCombatHistoryAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceCombatHistoryAggregateEntity, {instance, ps2AlertsEventType}, new Pagination({sortBy, order, page, pageSize}, false));
    }
}
