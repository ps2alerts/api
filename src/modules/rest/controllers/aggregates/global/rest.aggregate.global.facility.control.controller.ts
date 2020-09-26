import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Repository} from 'typeorm';
import {InjectRepository} from '@nestjs/typeorm';
import RestBaseController from '../../rest.base.controller';
import {World} from '../../../../data/constants/world.consts';
import GlobalFacilityControlAggregateEntity from '../../../../data/entities/aggregate/global/global.facility.control.aggregate.entity';

@ApiTags('global_facility_control_aggregate')
@Controller('aggregates')
export default class RestGlobalFacilityControlAggregateController extends RestBaseController<GlobalFacilityControlAggregateEntity>{

    constructor(
    @InjectRepository(GlobalFacilityControlAggregateEntity) repository: Repository<GlobalFacilityControlAggregateEntity>,
    ) {
        super(repository);
    }

    @Get('global/facility')
    @ApiOperation({summary: 'Return a filtered list of GlobalFacilityControlAggregateEntity aggregate'})
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalFacilityControlAggregateEntity aggregates',
        type: GlobalFacilityControlAggregateEntity,
        isArray: true,
    })
    async findAll(@Query('world') worldQuery?: World): Promise<GlobalFacilityControlAggregateEntity[]> {
        return await worldQuery ? this.findEntities({world: worldQuery}) : this.findEntities();
    }

    @Get('global/facility/:id')
    @ApiOperation({summary: 'Returns a GlobalFacilityControlAggregateEntity aggregate with given Id (or one of each world)'})
    @ApiResponse({
        status: 200,
        description: 'The GlobalFacilityControlAggregateEntity aggregate',
        type: GlobalFacilityControlAggregateEntity,
    })
    async findOne(@Param('id') id: number, @Query('world') worldQuery?: World): Promise<GlobalFacilityControlAggregateEntity | GlobalFacilityControlAggregateEntity[]> {
        return await worldQuery ? this.findEntity({facility: id, world: worldQuery}) : this.findEntitiesById('facility', id);
    }
}
