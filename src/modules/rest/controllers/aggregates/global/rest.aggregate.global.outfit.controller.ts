import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import RestBaseController from '../../rest.base.controller';
import {World} from '../../../../data/constants/world.consts';
import GlobalOutfitAggregateEntity from '../../../../data/entities/aggregate/global/global.outfit.aggregate.entity';

@ApiTags('global_outfit_aggregate')
@Controller('aggregates')
export default class RestGlobalOutfitAggregateController extends RestBaseController<GlobalOutfitAggregateEntity>{

    constructor(
    @InjectRepository(GlobalOutfitAggregateEntity) repository: Repository<GlobalOutfitAggregateEntity>,
    ) {
        super(repository);
    }

    @Get('global/outfit')
    @ApiOperation({summary: 'Return a filtered list of GlobalOutfitAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalOutfitAggregateEntity aggregates',
        type: GlobalOutfitAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world') worldQuery?: World): Promise<GlobalOutfitAggregateEntity[]> {
        return await worldQuery ? this.findEntities({world: worldQuery}) : this.findEntities();
    }

    @Get('global/outfit/:id')
    @ApiOperation({summary: 'Returns a GlobalOutfitAggregateEntity aggregate with given Id (or one of each world)'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalOutfitAggregateEntity aggregate',
        type: GlobalOutfitAggregateEntity,
    })
    async findOne(@Param('id') id: string, @Query('world') worldQuery?: World): Promise<GlobalOutfitAggregateEntity | GlobalOutfitAggregateEntity[]> {
        return await worldQuery ? this.findEntity({outfit: id, world: worldQuery}) : this.findEntitiesById('outfit', id);
    }
}
