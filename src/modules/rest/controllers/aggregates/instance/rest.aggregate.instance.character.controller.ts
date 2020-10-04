import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import RestBaseController from '../../rest.base.controller';
import InstanceCharacterAggregateEntity from '../../../../data/entities/aggregate/instance/instance.character.aggregate.entity';

@ApiTags('instance_character_aggregate')
@Controller('aggregates')
export default class RestInstanceCharacterAggregateController extends RestBaseController<InstanceCharacterAggregateEntity>{

    constructor(
    @InjectRepository(InstanceCharacterAggregateEntity) repository: Repository<InstanceCharacterAggregateEntity>,
    ) {
        super(repository);
    }

    @Get('instance/character')
    @ApiOperation({summary: 'Return a filtered list of InstanceCharacterAggregateEntity instances'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceCharacterAggregateEntity aggregates',
        type: InstanceCharacterAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('instance') instanceQuery?: string): Promise<InstanceCharacterAggregateEntity[]> {
        return await instanceQuery ? this.findEntities({instance: instanceQuery}) : this.findEntities();
    }

    @Get('instance/character/:id')
    @ApiOperation({summary: 'Returns a single InstanceCharacterAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceCharacterAggregateEntity Instance',
        type: InstanceCharacterAggregateEntity,
    })
    async findOne(@Param('id') id: string, @Query('instance') instanceQuery?: string): Promise<InstanceCharacterAggregateEntity | InstanceCharacterAggregateEntity[]> {
        return await instanceQuery ? this.findEntity({character: id, instance: instanceQuery}) : this.findEntitiesById('character', id);
    }
}
