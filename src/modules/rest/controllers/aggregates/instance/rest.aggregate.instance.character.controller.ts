import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceCharacterAggregateEntity from '../../../../data/entities/aggregate/instance/instance.character.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import Pagination from '../../../../../services/mongo/pagination';
import {PAGINATION_IMPLICIT_QUERIES} from '../../common/rest.pagination.queries';

@ApiTags('Instance Character Aggregates')
@Controller('aggregates')
export default class RestInstanceCharacterAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/character')
    @ApiOperation({summary: 'Returns a list of InstanceCharacterAggregateEntity aggregates for an instance'})
    @ApiImplicitQueries(PAGINATION_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceCharacterAggregateEntity aggregates',
        type: InstanceCharacterAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Param('instance') instance: string,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceCharacterAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceCharacterAggregateEntity, {instance}, new Pagination({sortBy, order, page, pageSize}));
    }

    @Get('instance/:instance/character/:character')
    @ApiOperation({summary: 'Returns a single InstanceCharacterAggregateEntity for an instance'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceCharacterAggregateEntity aggregate',
        type: InstanceCharacterAggregateEntity,
    })
    async findOne(
        @Param('instance') instance: string,
            @Param('character') character: string,
    ): Promise<InstanceCharacterAggregateEntity> {
        return await this.mongoOperationsService.findOne(InstanceCharacterAggregateEntity, {instance, 'character.id': character});
    }

    @Get('instance/character/:character')
    @ApiOperation({summary: 'Finds all InstanceCharacterAggregateEntity for a character'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceCharacterAggregateEntity aggregates by character ID',
        type: InstanceCharacterAggregateEntity,
        isArray: true,
    })
    async findByCharacterId(
        @Param('character') character: string,
    ): Promise<InstanceCharacterAggregateEntity[]> {
        return await this.mongoOperationsService.findOne(InstanceCharacterAggregateEntity, {'character.id': character});
    }
}
