import {Controller, Get, Inject, Param} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceWeaponAggregateEntity from '../../../../data/entities/aggregate/instance/instance.weapon.aggregate.entity';
import InstancePopulationAggregateEntity from '../../../../data/entities/aggregate/instance/instance.population.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';

@ApiTags('Instance Weapon Aggregates')
@Controller('aggregates')
export default class RestInstanceWeaponAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('instance/:instance/weapon')
    @ApiOperation({summary: 'Returns a list of InstanceWeaponAggregateEntity for an instance'})
    @ApiResponse({
        status: 200,
        description: 'The list of InstanceWeaponAggregateEntity aggregates',
        type: InstanceWeaponAggregateEntity,
        isArray: true,
    })
    async findAll(@Param('instance') instance?: string): Promise<InstanceWeaponAggregateEntity[]> {
        return this.mongoOperationsService.findMany(InstancePopulationAggregateEntity, {instance});
    }

    @Get('instance/:instance/weapon/:weapon')
    @ApiOperation({summary: 'Returns a InstanceWeaponAggregateEntity aggregate with given Id (or one of each instance)'})
    @ApiResponse({
        status: 200,
        description: 'The InstanceWeaponAggregateEntity aggregate',
        type: InstanceWeaponAggregateEntity,
    })
    async findOne(@Param('instance') instance: number, @Param('weapon') weapon: string): Promise<InstanceWeaponAggregateEntity | InstanceWeaponAggregateEntity[]> {
        return this.mongoOperationsService.findOne(InstanceWeaponAggregateEntity, {instance, weapon});
    }
}
