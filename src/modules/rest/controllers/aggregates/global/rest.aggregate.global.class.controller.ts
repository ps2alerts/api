import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import GlobalClassAggregateEntity from '../../../../data/entities/aggregate/global/global.class.aggregate.entity';
import RestBaseController from '../../rest.base.controller';
import {World} from '../../../../data/constants/world.consts';
import {Loadout} from '../../../../data/constants/loadout.consts';

@ApiTags('global_class_aggregate')
@Controller('aggregates')
export default class RestGlobalClassAggregateController extends RestBaseController<GlobalClassAggregateEntity>{

    constructor(
    @InjectRepository(GlobalClassAggregateEntity) repository: Repository<GlobalClassAggregateEntity>,
    ) {
        super(repository);
    }

    @Get('global/class')
    @ApiOperation({summary: 'Return a filtered list of GlobalClassAggregateEntity aggregates'})
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalClassAggregateEntity aggregates',
        type: GlobalClassAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world') worldQuery?: World): Promise<GlobalClassAggregateEntity[]> {
        return await worldQuery ? this.findEntities({world: worldQuery}) : this.findEntities();
    }

    @Get('global/class/:id')
    @ApiOperation({summary: 'Returns a single GlobalClassAggregateEntity aggregate (or one of each world)'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalClassAggregateEntity aggregate',
        type: GlobalClassAggregateEntity,
    })
    async findOne(@Param('id') id: Loadout, @Query('world') worldQuery?: World): Promise<GlobalClassAggregateEntity | GlobalClassAggregateEntity[]> {
        return await worldQuery ? this.findEntity({class: id, world: worldQuery}) : this.findEntitiesById('class', id);
    }
}
