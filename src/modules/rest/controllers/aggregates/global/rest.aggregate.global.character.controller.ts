import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalCharacterAggregateEntity from '../../../../data/entities/aggregate/global/global.character.aggregate.entity';
import {World} from '../../../../data/constants/world.consts';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('Global Character Aggregates')
@Controller('aggregates')
export default class RestGlobalCharacterAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/character')
    @ApiOperation({summary: 'Return a filtered list of GlobalCharacterAggregateEntity instances'})
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalCharacterAggregateEntity aggregates',
        type: GlobalCharacterAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world') world?: World): Promise<GlobalCharacterAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(GlobalCharacterAggregateEntity, {world})
            : await this.mongoOperationsService.findMany(GlobalCharacterAggregateEntity);
    }

    @Get('global/character/:id')
    @ApiOperation({summary: 'Returns a single GlobalCharacterAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalCharacterAggregateEntity Instance',
        type: GlobalCharacterAggregateEntity,
    })
    async findOne(@Param('character') id: string): Promise<GlobalCharacterAggregateEntity> {
        return await this.mongoOperationsService.findOne(GlobalCharacterAggregateEntity, {character: id});
    }
}