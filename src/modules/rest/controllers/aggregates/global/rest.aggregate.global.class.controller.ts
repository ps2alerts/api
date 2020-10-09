import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalClassAggregateEntity from '../../../../data/entities/aggregate/global/global.class.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('Global Class Aggregates')
@Controller('aggregates')
export default class RestGlobalClassAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/class')
    @ApiOperation({summary: 'Return a filtered list of GlobalClassAggregateEntity aggregates'})
    @ApiResponse({
        status: 200,
        description: 'The list of matching GlobalClassAggregateEntity aggregates',
        type: GlobalClassAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world') world?: string): Promise<GlobalClassAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(GlobalClassAggregateEntity, {world: parseInt(world, 10)})
            : await this.mongoOperationsService.findMany(GlobalClassAggregateEntity);
    }

    @Get('global/class/:loadout')
    @ApiOperation({summary: 'Returns a single/many GlobalClassAggregateEntity aggregate(s) by loadout ID (and world?)'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalClassAggregateEntity aggregate(s)',
        type: GlobalClassAggregateEntity,
    })
    async findOne(@Param('loadout') loadout: string, @Query('world') world?: string): Promise<GlobalClassAggregateEntity | GlobalClassAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalClassAggregateEntity, {class: parseInt(loadout, 10), world: parseInt(world, 10)})
            : await this.mongoOperationsService.findMany(GlobalClassAggregateEntity, {class: parseInt(loadout, 10)});
    }
}
