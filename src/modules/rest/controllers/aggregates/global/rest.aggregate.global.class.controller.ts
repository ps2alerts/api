import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalClassAggregateEntity from '../../../../data/entities/aggregate/global/global.class.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {ApiImplicitQuery} from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import {WORLD_IMPLICIT_QUERY} from '../../common/rest.world.query';
import {NullableIntPipe} from '../../../pipes/NullableIntPipe';
import {Loadout} from '../../../../data/constants/loadout.consts';
import {World} from '../../../../data/constants/world.consts';

@ApiTags('Global Class Aggregates')
@Controller('aggregates')
export default class RestGlobalClassAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/class')
    @ApiOperation({summary: 'Return a filtered list of GlobalClassAggregateEntity aggregates'})
    @ApiImplicitQuery(WORLD_IMPLICIT_QUERY)
    @ApiResponse({
        status: 200,
        description: 'The list of matching GlobalClassAggregateEntity aggregates',
        type: GlobalClassAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world', NullableIntPipe) world?: World): Promise<GlobalClassAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(GlobalClassAggregateEntity, {world})
            : await this.mongoOperationsService.findMany(GlobalClassAggregateEntity);
    }

    @Get('global/class/:loadout')
    @ApiOperation({summary: 'Returns a single/many GlobalClassAggregateEntity aggregate(s) by loadout ID (and world)'})
    @ApiImplicitQuery(WORLD_IMPLICIT_QUERY)
    @ApiResponse({
        status: 200,
        description: 'The GlobalClassAggregateEntity aggregate(s)',
        type: GlobalClassAggregateEntity,
    })
    async findOne(
        @Param('loadout', ParseIntPipe) loadout: Loadout,
            @Query('world', NullableIntPipe) world?: World,
    ): Promise<GlobalClassAggregateEntity | GlobalClassAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalClassAggregateEntity, {class: loadout, world})
            : await this.mongoOperationsService.findMany(GlobalClassAggregateEntity, {class: loadout});
    }
}
