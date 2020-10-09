import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalFacilityControlAggregateEntity from '../../../../data/entities/aggregate/global/global.facility.control.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('Global Facility Control Aggregates')
@Controller('aggregates')
export default class RestGlobalFacilityControlAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/facility')
    @ApiOperation({summary: 'Return a filtered list of GlobalFacilityControlAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalFacilityControlAggregateEntity aggregates',
        type: GlobalFacilityControlAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world') world?: string): Promise<GlobalFacilityControlAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findMany(GlobalFacilityControlAggregateEntity, {world: parseInt(world, 10)})
            : await this.mongoOperationsService.findMany(GlobalFacilityControlAggregateEntity);
    }

    @Get('global/facility/:facility')
    @ApiOperation({summary: 'Returns a GlobalFacilityControlAggregateEntity aggregate with given Id (or one of each world)'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalFacilityControlAggregateEntity aggregate',
        type: GlobalFacilityControlAggregateEntity,
    })
    async findOne(@Param('facility') facility: string, @Query('world') world?: string): Promise<GlobalFacilityControlAggregateEntity | GlobalFacilityControlAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalFacilityControlAggregateEntity, {facility: parseInt(facility, 10), world: parseInt(world, 10)})
            : await this.mongoOperationsService.findOne(GlobalFacilityControlAggregateEntity, {facility: parseInt(facility, 10)});
    }
}
