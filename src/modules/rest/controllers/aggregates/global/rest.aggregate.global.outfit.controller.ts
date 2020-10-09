import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalOutfitAggregateEntity from '../../../../data/entities/aggregate/global/global.outfit.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('Global Outfit Aggregates')
@Controller('aggregates')
export default class RestGlobalOutfitAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/outfit')
    @ApiOperation({summary: 'Return a filtered list of GlobalOutfitAggregateEntity aggregates'})
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalOutfitAggregateEntity aggregates',
        type: GlobalOutfitAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world') world?: string): Promise<GlobalOutfitAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(GlobalOutfitAggregateEntity, {world: parseInt(world, 10)})
            : await this.mongoOperationsService.findMany(GlobalOutfitAggregateEntity);
    }

    @Get('global/outfit/:outfit')
    @ApiOperation({summary: 'Returns a GlobalOutfitAggregateEntity aggregate with given Id (or one of each world as a PS4 outfit may share the same ID as PC)'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalOutfitAggregateEntity aggregate(s)',
        type: GlobalOutfitAggregateEntity,
    })
    async findOne(@Param('outfit') outfit: string, @Query('world') world?: string): Promise<GlobalOutfitAggregateEntity | GlobalOutfitAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalOutfitAggregateEntity, {outfit, world: parseInt(world, 10)})
            : await this.mongoOperationsService.findMany(GlobalOutfitAggregateEntity, {outfit});
    }
}
