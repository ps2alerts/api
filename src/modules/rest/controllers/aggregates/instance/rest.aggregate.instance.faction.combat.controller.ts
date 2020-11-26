import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceFactionCombatAggregateEntity from '../../../../data/entities/aggregate/instance/instance.faction.combat.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {PAGINATION_IMPLICIT_QUERIES} from '../../common/rest.pagination.queries';
import Pagination from '../../../../../services/mongo/pagination';

@ApiTags('Instance Faction Combat Aggregates')
@Controller('aggregates')
export default class RestInstanceFactionCombatAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/faction')
    @ApiOperation({summary: 'Returns a list of InstanceFactionCombatAggregateEntity for an instance'})
    @ApiImplicitQueries(PAGINATION_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceFactionCombatAggregateEntity aggregates',
        type: InstanceFactionCombatAggregateEntity,
        isArray: false,
    })
    async findAll(
        @Param('instance') instance: string,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceFactionCombatAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceFactionCombatAggregateEntity, {instance}, new Pagination({sortBy, order, page, pageSize}));
    }
}
