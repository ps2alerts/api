import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalCharacterAggregateEntity from '../../../../data/entities/aggregate/global/global.character.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {ApiImplicitQuery} from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import {WORLD_IMPLICIT_QUERY} from '../../common/rest.world.query';
import {NullableIntPipe} from '../../../pipes/NullableIntPipe';
import {World} from '../../../../data/constants/world.consts';

@ApiTags('Global Character Aggregates')
@Controller('aggregates')
export default class RestGlobalCharacterAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/character')
    @ApiOperation({summary: 'Return a filtered list of GlobalCharacterAggregateEntity instances'})
    @ApiImplicitQuery(WORLD_IMPLICIT_QUERY)
    @ApiResponse({
        status: 200,
        description: 'The list of matching GlobalCharacterAggregateEntity aggregates',
        type: GlobalCharacterAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world', NullableIntPipe) world?: World): Promise<GlobalCharacterAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(GlobalCharacterAggregateEntity, {world})
            : await this.mongoOperationsService.findMany(GlobalCharacterAggregateEntity);
    }

    @Get('global/character/:character')
    @ApiOperation({summary: 'Returns a single GlobalCharacterAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalCharacterAggregateEntity aggregate',
        type: GlobalCharacterAggregateEntity,
    })
    async findOne(@Param('character') character: string): Promise<GlobalCharacterAggregateEntity> {
        return await this.mongoOperationsService.findOne(GlobalCharacterAggregateEntity, {character});
    }
}
