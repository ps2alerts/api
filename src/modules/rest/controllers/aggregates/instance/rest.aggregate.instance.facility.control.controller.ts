import {Controller, Get, Inject, Param} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceFacilityControlAggregateEntity from '../../../../data/entities/aggregate/instance/instance.facility.control.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('Instance Facility Control Aggregates')
@Controller('aggregates')
export default class RestInstanceFacilityControlAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/facility')
    @ApiOperation({summary: 'Returns a list of InstanceFacilityControlAggregateEntity for an instance'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceFacilityControlAggregateEntity aggregates',
        type: InstanceFacilityControlAggregateEntity,
        isArray: true,
    })
    async findAll(@Param('instance') instance: string): Promise<InstanceFacilityControlAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceFacilityControlAggregateEntity, {instance});
    }

    @Get('instance/:instance/facility/:facility')
    @ApiOperation({summary: 'Returns a InstanceFacilityControlAggregateEntity aggregate for an instance and specific facility'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceFacilityControlAggregateEntity aggregate',
        type: InstanceFacilityControlAggregateEntity,
    })
    async findOne(@Param('instance') instance: string, @Param('facility') facility: string): Promise<InstanceFacilityControlAggregateEntity> {
        return await this.mongoOperationsService.findOne(InstanceFacilityControlAggregateEntity, {instance, facility: parseInt(facility, 10)});
    }
}
