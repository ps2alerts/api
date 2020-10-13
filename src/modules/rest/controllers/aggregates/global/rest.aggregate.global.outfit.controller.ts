import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalOutfitAggregateEntity from '../../../../data/entities/aggregate/global/global.outfit.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {NullableIntPipe} from '../../../pipes/NullableIntPipe';
import {World} from '../../../../data/constants/world.consts';
import {ApiImplicitQuery} from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import {WORLD_IMPLICIT_QUERY} from '../../common/rest.world.query';

@ApiTags('Global Outfit Aggregates')
@Controller('aggregates')
export default class RestGlobalOutfitAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/outfit')
    @ApiOperation({summary: 'Return a filtered list of GlobalOutfitAggregateEntity aggregates'})
    @ApiImplicitQuery(WORLD_IMPLICIT_QUERY)
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalOutfitAggregateEntity aggregates',
        type: GlobalOutfitAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world', NullableIntPipe) world?: World): Promise<GlobalOutfitAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(GlobalOutfitAggregateEntity, {world})
            : await this.mongoOperationsService.findMany(GlobalOutfitAggregateEntity);
    }

    @Get('global/outfit/:outfit')
    @ApiOperation({summary: 'Returns a GlobalOutfitAggregateEntity aggregate with given Id (or one of each world as a PS4 outfit may share the same ID as PC)'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalOutfitAggregateEntity aggregate(s)',
        type: GlobalOutfitAggregateEntity,
    })
    async findOne(
        @Param('outfit') outfit: string,
            @Query('world', NullableIntPipe) world?: World,
    ): Promise<GlobalOutfitAggregateEntity | GlobalOutfitAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalOutfitAggregateEntity, {outfit, world})
            : await this.mongoOperationsService.findMany(GlobalOutfitAggregateEntity, {outfit});
    }
}
