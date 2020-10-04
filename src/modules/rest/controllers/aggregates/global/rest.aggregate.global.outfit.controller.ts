import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {World} from '../../../../data/constants/world.consts';
import GlobalOutfitAggregateEntity from '../../../../data/entities/aggregate/global/global.outfit.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('global_outfit_aggregate')
@Controller('aggregates')
export default class RestGlobalOutfitAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/outfit')
    @ApiOperation({summary: 'Return a filtered list of GlobalOutfitAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalOutfitAggregateEntity aggregates',
        type: GlobalOutfitAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world') world?: World): Promise<GlobalOutfitAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(GlobalOutfitAggregateEntity, {world})
            : await this.mongoOperationsService.findMany(GlobalOutfitAggregateEntity);
    }

    @Get('global/outfit/:id')
    @ApiOperation({summary: 'Returns a GlobalOutfitAggregateEntity aggregate with given Id (or one of each world as a PS4 outfit may share the same ID as PC)'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalOutfitAggregateEntity aggregate',
        type: GlobalOutfitAggregateEntity,
    })
    async findOne(@Param('id') id: string, @Query('world') world?: World): Promise<GlobalOutfitAggregateEntity> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalOutfitAggregateEntity, {outfit: id, world})
            : await this.mongoOperationsService.findOne(GlobalOutfitAggregateEntity, {outfit: id});
    }
}
