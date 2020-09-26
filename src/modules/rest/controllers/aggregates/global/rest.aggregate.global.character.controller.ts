import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import GlobalCharacterAggregateEntity from '../../../../data/entities/aggregate/global/global.character.aggregate.entity';
import RestBaseController from '../../rest.base.controller';
import {World} from '../../../../data/constants/world.consts';

@ApiTags('global_character_aggregate')
@Controller('aggregates')
export default class RestGlobalCharacterAggregateController extends RestBaseController<GlobalCharacterAggregateEntity>{

    constructor(
    @InjectRepository(GlobalCharacterAggregateEntity) repository: Repository<GlobalCharacterAggregateEntity>,
    ) {
        super(repository);
    }

    @Get('global/character')
    @ApiOperation({summary: 'Return a filtered list of GlobalCharacterAggregateEntity instances'})
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalCharacterAggregateEntity aggregates',
        type: GlobalCharacterAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world') worldQuery?: World): Promise<GlobalCharacterAggregateEntity[]> {
        return await worldQuery ? this.findEntities({world: worldQuery}) : this.findEntities();
    }

    @Get('global/character/:id')
    @ApiOperation({summary: 'Returns a single GlobalCharacterAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalCharacterAggregateEntity Instance',
        type: GlobalCharacterAggregateEntity,
    })
    async findOne(@Param('id') id: string): Promise<GlobalCharacterAggregateEntity> {
        return await this.findEntityById('character', id);
    }
}
