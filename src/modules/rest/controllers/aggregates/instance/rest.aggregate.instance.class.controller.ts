import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import InstanceClassAggregateEntity from '../../../../data/entities/aggregate/instance/instance.class.aggregate.entity';
import RestBaseController from '../../rest.base.controller';
import {Loadout} from '../../../../data/constants/loadout.consts';

@ApiTags('instance_class_aggregate')
@Controller('aggregates')
export default class RestInstanceClassAggregateController extends RestBaseController<InstanceClassAggregateEntity>{

    constructor(
    @InjectRepository(InstanceClassAggregateEntity) repository: Repository<InstanceClassAggregateEntity>,
    ) {
        super(repository);
    }

    @Get('instance/class')
    @ApiOperation({summary: 'Return a filtered list of InstanceClassAggregateEntity aggregates'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceClassAggregateEntity aggregates',
        type: InstanceClassAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('instance') instanceQuery?: string): Promise<InstanceClassAggregateEntity[]> {
        return await instanceQuery ? this.findEntities({instance: instanceQuery}) : this.findEntities();
    }

    @Get('instance/class/:id')
    @ApiOperation({summary: 'Returns a list of InstanceClassAggregateEntity aggregates within an instance'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceClassAggregateEntity aggregate',
        type: InstanceClassAggregateEntity,
    })
    async findOne(@Param('id') id: Loadout, @Query('instance') instanceQuery?: string): Promise<InstanceClassAggregateEntity | InstanceClassAggregateEntity[]> {
        return await instanceQuery ? this.findEntity({class: id, instance: instanceQuery}) : this.findEntitiesById('class', id);
    }
}
