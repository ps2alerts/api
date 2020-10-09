import {Controller, Get, Inject, Param} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceClassAggregateEntity from '../../../../data/entities/aggregate/instance/instance.class.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('Instance Class Aggregates')
@Controller('aggregates')
export default class RestInstanceClassAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/class')
    @ApiOperation({summary: 'Returns a list of InstanceClassAggregateEntity for an instance'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceClassAggregateEntity aggregates',
        type: InstanceClassAggregateEntity,
        isArray: true,
    })
    async findAll(@Param('instance') instance: string): Promise<InstanceClassAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceClassAggregateEntity, {instance});
    }

    // Note we use loadout here because class is a NodeJS reserved name and TS gets confused
    @Get('instance/:instance/class/:loadout')
    @ApiOperation({summary: 'Returns a specific class of InstanceClassAggregateEntity aggregates within an instance'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceClassAggregateEntity aggregate',
        type: InstanceClassAggregateEntity,
    })
    async findOne(@Param('instance') instance: string, @Param('loadout') loadout: string): Promise<InstanceClassAggregateEntity | InstanceClassAggregateEntity[]> {
        return await this.mongoOperationsService.findOne(InstanceClassAggregateEntity, {instance, class: parseInt(loadout, 10)});
    }
}
