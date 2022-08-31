import {Controller, Get, Inject, Param, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceFactionCombatAggregateEntity from '../../../../data/entities/aggregate/instance/instance.faction.combat.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {Ps2AlertsEventTypePipe} from '../../../pipes/Ps2AlertsEventTypePipe';
import {Ps2AlertsEventType} from '../../../../data/ps2alerts-constants/ps2AlertsEventType';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {INSTANCE_IMPLICIT_QUERY} from '../../common/rest.instance.query';
import {PS2ALERTS_EVENT_TYPE_QUERY} from '../../common/rest.ps2AlertsEventType.query';

@ApiTags('Instance Faction Combat Aggregates')
@Controller('aggregates')
export default class RestInstanceFactionCombatAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/faction')
    @ApiOperation({summary: 'Returns the InstanceFactionCombatAggregateEntity for an instance'})
    @ApiImplicitQueries([INSTANCE_IMPLICIT_QUERY, PS2ALERTS_EVENT_TYPE_QUERY])
    @ApiResponse({
        status: 200,
        description: 'The InstanceFactionCombatAggregateEntity aggregate',
        type: InstanceFactionCombatAggregateEntity,
    })
    async findOne(
        @Param('instance') instance: string,
            @Query('ps2AlertsEventType', Ps2AlertsEventTypePipe) ps2AlertsEventType?: Ps2AlertsEventType,
    ): Promise<InstanceFactionCombatAggregateEntity> {
        return this.mongoOperationsService.findOne(InstanceFactionCombatAggregateEntity, {instance, ps2AlertsEventType});
    }
}
