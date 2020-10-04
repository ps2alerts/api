import {Controller, Get, Inject, Param} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceFacilityControlEntity from '../../data/entities/instance/instance.facilitycontrol.entity';
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';

@ApiTags('Instance Facility Control Entries')
@Controller('instance-entries')
export default class RestInstanceFacilityControlController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get(':instance/facility')
    @ApiOperation({summary: 'Returns a list of InstanceFacilityControlEntity for an instance'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceFacilityControlEntity for an instance',
        type: InstanceFacilityControlEntity,
        isArray: true,
    })
    async findAll(@Param('instance') instance: string): Promise<InstanceFacilityControlEntity[]> {
        return await this.mongoOperationsService.findMany(InstanceFacilityControlEntity, {instance});
    }

    @Get(':instance/facility/:facility')
    @ApiOperation({summary: 'Return a filtered list of InstanceFacilityControlEntity for an instance'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceFacilityControlEntity',
        type: InstanceFacilityControlEntity,
    })
    async findOne(@Param('instance') instance: string, @Param('facility') facility: string): Promise<InstanceFacilityControlEntity> {
        return await this.mongoOperationsService.findOne(InstanceFacilityControlEntity, {instance, facility});
    }
}
