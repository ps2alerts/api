import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import RestBaseController from '../../rest.base.controller';
import InstanceFacilityControlAggregateEntity from '../../../../data/entities/aggregate/instance/instance.facility.control.aggregate.entity';

@ApiTags('instance_facility_control_aggregate')
@Controller('aggregates')
export default class RestInstanceFacilityControlAggregateController extends RestBaseController<InstanceFacilityControlAggregateEntity>{

    constructor(
    @InjectRepository(InstanceFacilityControlAggregateEntity) repository: Repository<InstanceFacilityControlAggregateEntity>,
    ) {
        super(repository);
    }

    @Get('instance/facility')
    @ApiOperation({summary: 'Return a filtered list of InstanceFacilityControlAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceFacilityControlAggregateEntity aggregates',
        type: InstanceFacilityControlAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('instance') instanceQuery?: string): Promise<InstanceFacilityControlAggregateEntity[]> {
        return await instanceQuery ? this.findEntities({instance: instanceQuery}) : this.findEntities();
    }

    @Get('instance/facility/:id')
    @ApiOperation({summary: 'Returns a InstanceFacilityControlAggregateEntity aggregate with given Id (or one of each world)'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceFacilityControlAggregateEntity aggregate',
        type: InstanceFacilityControlAggregateEntity,
    })
    async findOne(@Param('id') id: number, @Query('instance') instanceQuery?: string): Promise<InstanceFacilityControlAggregateEntity | InstanceFacilityControlAggregateEntity[]> {
        return await instanceQuery ? this.findEntity({facility: id, instance: instanceQuery}) : this.findEntitiesById('facility', id);
    }

}
