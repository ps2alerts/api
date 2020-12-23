import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalCharacterAggregateEntity from '../../../../data/entities/aggregate/global/global.character.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {World} from '../../../../data/constants/world.consts';
import Pagination from '../../../../../services/mongo/pagination';

@ApiTags('Global Character Aggregates')
@Controller('aggregates')
export default class RestGlobalCharacterAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/character')
    @ApiOperation({summary: 'Return a filtered list of GlobalCharacterAggregateEntity instances'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of matching GlobalCharacterAggregateEntity aggregates',
        type: GlobalCharacterAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalCharacterAggregateEntity[]> {
        return await this.mongoOperationsService.findMany(GlobalCharacterAggregateEntity, {world}, new Pagination({sortBy, order, page, pageSize}, 'global'));
    }

    @Get('global/character/:character')
    @ApiOperation({summary: 'Returns a single GlobalCharacterAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalCharacterAggregateEntity aggregate',
        type: GlobalCharacterAggregateEntity,
    })
    async findOne(@Param('character') character: string): Promise<GlobalCharacterAggregateEntity> {
        return await this.mongoOperationsService.findOne(GlobalCharacterAggregateEntity, {'character.id': character});
    }
}
