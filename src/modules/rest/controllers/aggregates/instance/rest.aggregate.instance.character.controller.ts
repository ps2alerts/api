import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceCharacterAggregateEntity from '../../../../data/entities/aggregate/instance/instance.character.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import Pagination from '../../../../../services/mongo/pagination';
import {Ps2AlertsEventTypePipe} from '../../../pipes/Ps2AlertsEventTypePipe';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';
import {AGGREGATE_INSTANCE_COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {PS2ALERTS_EVENT_TYPE_QUERY} from '../../common/rest.ps2AlertsEventType.query';
import {INSTANCE_IMPLICIT_QUERY} from '../../common/rest.instance.query';

@ApiTags('Instance Character Aggregates')
@Controller('aggregates')
export default class RestInstanceCharacterAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/character')
    @ApiOperation({summary: 'Returns a list of InstanceCharacterAggregateEntity aggregates for an instance'})
    @ApiImplicitQueries(AGGREGATE_INSTANCE_COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceCharacterAggregateEntity aggregates',
        type: InstanceCharacterAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Param('instance') instance: string,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceCharacterAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceCharacterAggregateEntity, {instance, ps2AlertsEventType}, new Pagination({sortBy, order, page, pageSize}, false));
    }

    @Get('instance/:instance/character/:character')
    @ApiOperation({summary: 'Returns a single InstanceCharacterAggregateEntity for an instance'})
    @ApiImplicitQueries([INSTANCE_IMPLICIT_QUERY, PS2ALERTS_EVENT_TYPE_QUERY])
    @ApiResponse({
        status: 200,
        description: 'The InstanceCharacterAggregateEntity aggregate',
        type: InstanceCharacterAggregateEntity,
    })
    async findOne(
        @Param('instance') instance: string,
            @Param('character') character: string,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,

    ): Promise<InstanceCharacterAggregateEntity> {
        return await this.mongoOperationsService.findOne(InstanceCharacterAggregateEntity, {instance, 'character.id': character, ps2AlertsEventType});
    }

    @Get('instance/character/:character')
    @ApiOperation({summary: 'Finds all InstanceCharacterAggregateEntity for a character'})
    @ApiImplicitQueries([PS2ALERTS_EVENT_TYPE_QUERY])
    @ApiResponse({
        status: 200,
        description: 'The InstanceCharacterAggregateEntity aggregates by character ID',
        type: InstanceCharacterAggregateEntity,
        isArray: true,
    })
    async findByCharacterId(
        @Param('character') character: string,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,

    ): Promise<InstanceCharacterAggregateEntity[]> {
        return await this.mongoOperationsService.findOne(InstanceCharacterAggregateEntity, {'character.id': character, ps2AlertsEventType});
    }
}
