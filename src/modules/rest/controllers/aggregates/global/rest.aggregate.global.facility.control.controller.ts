import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalFacilityControlAggregateEntity from '../../../../data/entities/aggregate/global/global.facility.control.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {ApiImplicitQuery} from '@nestjs/swagger/dist/decorators/api-implicit-query.decorator';
import {WORLD_IMPLICIT_QUERY} from '../../common/rest.world.query';
import {NullableIntPipe} from '../../../pipes/NullableIntPipe';
import {World} from '../../../../data/constants/world.consts';

@ApiTags('Global Facility Control Aggregates')
@Controller('aggregates')
export default class RestGlobalFacilityControlAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/facility')
    @ApiOperation({summary: 'Return a filtered list of GlobalFacilityControlAggregateEntity aggregates'})
    @ApiImplicitQuery(WORLD_IMPLICIT_QUERY)
    @ApiResponse({
        status: 200,
        description: 'The list of matching GlobalFacilityControlAggregateEntity aggregates',
        type: GlobalFacilityControlAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world', NullableIntPipe) world?: World): Promise<GlobalFacilityControlAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(GlobalFacilityControlAggregateEntity, {world})
            : await this.mongoOperationsService.findMany(GlobalFacilityControlAggregateEntity);
    }

    @Get('global/facility/:facility')
    @ApiOperation({summary: 'Returns the matching GlobalFacilityControlAggregateEntity aggregate(s) with given Id (or one of each world)'})
    @ApiImplicitQuery(WORLD_IMPLICIT_QUERY)
    @ApiResponse({
        status: 200,
        description: 'The GlobalFacilityControlAggregateEntity aggregate(s)',
        type: GlobalFacilityControlAggregateEntity,
    })
    async findOne(
        @Param('facility', ParseIntPipe) facility: number,
            @Query('world', NullableIntPipe) world?: World,
    ): Promise<GlobalFacilityControlAggregateEntity | GlobalFacilityControlAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalFacilityControlAggregateEntity, {facility, world})
            : await this.mongoOperationsService.findMany(GlobalFacilityControlAggregateEntity, {facility});
    }
}
