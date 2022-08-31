import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceWeaponAggregateEntity from '../../../../data/entities/aggregate/instance/instance.weapon.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import Pagination from '../../../../../services/mongo/pagination';
import {AGGREGATE_INSTANCE_COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import {Ps2AlertsEventTypePipe} from '../../../pipes/Ps2AlertsEventTypePipe';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';

@ApiTags('Instance Weapon Aggregates')
@Controller('aggregates')
export default class RestInstanceWeaponAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/weapon')
    @ApiOperation({summary: 'Returns a list of InstanceWeaponAggregateEntity for an instance'})
    @ApiImplicitQueries(AGGREGATE_INSTANCE_COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceWeaponAggregateEntity aggregates',
        type: InstanceWeaponAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Param('instance') instance: string,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number): Promise<InstanceWeaponAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstanceWeaponAggregateEntity, {instance, ps2AlertsEventType}, new Pagination({sortBy, order, page, pageSize}, false));
    }

    @Get('instance/:instance/weapon/:weapon')
    @ApiOperation({summary: 'Returns a InstanceWeaponAggregateEntity aggregate with given Id (or one of each instance)'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceWeaponAggregateEntity aggregate',
        type: InstanceWeaponAggregateEntity,
    })
    async findOne(
        @Param('instance') instance: number,
            @Param('weapon', ParseIntPipe) weapon: number,
    ): Promise<InstanceWeaponAggregateEntity> {
        return this.mongoOperationsService.findOne(InstanceWeaponAggregateEntity, {instance, 'weapon.id': weapon});
    }
}
