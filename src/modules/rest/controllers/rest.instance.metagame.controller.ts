import {ClassSerializerInterceptor, Controller, Get, Inject, Param, Query, UseInterceptors} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import InstanceMetagameTerritoryEntity from '../../data/entities/instance/instance.metagame.territory.entity';
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';
import {Ps2alertsEventState} from '../../data/constants/eventstate.consts';
import {OptionalIntPipe} from '../pipes/OptionalIntPipe';
import {World} from '../../data/constants/world.consts';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import Pagination from '../../../services/mongo/pagination';
import {COMMON_IMPLICIT_QUERIES} from './common/rest.common.queries';
import {Zone} from '../../data/constants/zone.consts';
import {TIME_STARTED_IMPLICIT_QUERIES} from './common/rest.time.started.query';
import {OptionalDatePipe} from '../pipes/OptionalDatePipe';
import Range from '../../../services/mongo/range';

const INSTANCE_IMPLICIT_QUERIES = [
    TIME_STARTED_IMPLICIT_QUERIES,
    ...COMMON_IMPLICIT_QUERIES,
];

interface TerritoryControlFilterInterface {
    world?: World;
    zone?: Zone;
    timeStarted?: Range;
}

@ApiTags('Instances')
@Controller('instances')
export class RestInstanceMetagameController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('/:instance')
    @ApiOperation({summary: 'Returns a single metagame instance'})
    @ApiResponse({
        status: 200,
        description: 'The Metagame Instance',
        type: InstanceMetagameTerritoryEntity,
    })
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(@Param('instance') instanceId: string): Promise<InstanceMetagameTerritoryEntity> {
        return await this.mongoOperationsService.findOne(
            InstanceMetagameTerritoryEntity,
            {instanceId},
        );
    }

    @Get('/active')
    @ApiOperation({summary: 'Returns all currently running metagame instances, optionally requested by world'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'A list of active metagame instances',
        type: InstanceMetagameTerritoryEntity,
        isArray: true,
    })
    @UseInterceptors(ClassSerializerInterceptor)
    async findActives(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('zone', OptionalIntPipe) zone?: Zone,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceMetagameTerritoryEntity[]> {
        return await this.mongoOperationsService.findMany(
            InstanceMetagameTerritoryEntity,
            {
                state: Ps2alertsEventState.STARTED,
                world,
                zone,
            },
            new Pagination({sortBy, order, page, pageSize}));
    }

    @Get('/territory-control')
    @ApiOperation({summary: 'Return a paginated list of metagame territory control instances, optionally requested by world'})
    @ApiImplicitQueries(INSTANCE_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'List of MetagameTerritory Instances',
        type: InstanceMetagameTerritoryEntity,
        isArray: true,
    })
    async findAllTerritoryControl(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('zone', OptionalIntPipe) zone?: Zone,
            @Query('timeStartedFrom', OptionalDatePipe) timeStartedFrom?: Date,
            @Query('timeStartedTo', OptionalDatePipe) timeStartedTo?: Date,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceMetagameTerritoryEntity[]> {
        const timeStartedObj = new Range('timeStarted', timeStartedFrom?.toISOString(), timeStartedTo?.toISOString());
        console.log(timeStartedObj.build());
        const filter: TerritoryControlFilterInterface = {
            world,
            zone,
        };

        if (timeStartedObj.valid) {
            filter.timeStarted = timeStartedObj;
        }

        return await this.mongoOperationsService.findMany(InstanceMetagameTerritoryEntity, filter, new Pagination({sortBy, order, page, pageSize}));
    }
}
