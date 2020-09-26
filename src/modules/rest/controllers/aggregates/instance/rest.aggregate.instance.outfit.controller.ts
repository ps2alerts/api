import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import RestBaseController from '../../rest.base.controller';
import InstanceOutfitAggregateEntity from '../../../../data/entities/aggregate/instance/instance.outfit.aggregate.entity';

@ApiTags('instance_outfit_aggregate')
@Controller('aggregates')
export default class RestInstanceOutfitAggregateController extends RestBaseController<InstanceOutfitAggregateEntity>{

    constructor(
    @InjectRepository(InstanceOutfitAggregateEntity) repository: Repository<InstanceOutfitAggregateEntity>,
    ) {
        super(repository);
    }

    @Get('instance/outfit')
    @ApiOperation({summary: 'Return a filtered list of InstanceOutfitAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceOutfitAggregateEntity aggregates',
        type: InstanceOutfitAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('instance') instanceQuery?: string): Promise<InstanceOutfitAggregateEntity[]> {
        return await instanceQuery ? this.findEntities({instance: instanceQuery}) : this.findEntities();
    }

    @Get('instance/outfit/:id')
    @ApiOperation({summary: 'Returns a InstanceOutfitAggregateEntity aggregate with given id within an instance'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceOutfitAggregateEntity aggregate',
        type: InstanceOutfitAggregateEntity,
    })
    async findOne(@Param('id') id: string, @Query('instance') instanceQuery?: string): Promise<InstanceOutfitAggregateEntity | InstanceOutfitAggregateEntity[]> {
        return await instanceQuery ? this.findEntity({outfit: id, instance: instanceQuery}) : this.findEntitiesById('outfit', id);
    }
}
