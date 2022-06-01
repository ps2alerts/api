import {
    Body,
    ClassSerializerInterceptor,
    Controller, Delete,
    Get, HttpCode,
    Inject,
    Param, Patch, Post,
    Query, UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiAcceptedResponse,
    ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse,
    ApiOperation,
    ApiResponse,
    ApiSecurity,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
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
import {Bracket} from '../../data/constants/bracket.consts';
import {BRACKET_IMPLICIT_QUERY} from './common/rest.bracket.query';
import {RESULT_VICTOR_QUERY} from './common/rest.result.victor.query';
import {Faction} from '../../data/constants/faction.consts';
import {RedisCacheService} from '../../../services/cache/redis.cache.service';
import {AuthGuard} from '@nestjs/passport';
import {UpdateInstanceMetagameDto} from '../Dto/UpdateInstanceMetagameDto';
import {CreateInstanceMetagameDto} from '../Dto/CreateInstanceMetagameDto';
import {ObjectID} from 'typeorm';
import {MandatoryIntPipe} from '../pipes/MandatoryIntPipe';

const INSTANCE_IMPLICIT_QUERIES = [
    BRACKET_IMPLICIT_QUERY,
    RESULT_VICTOR_QUERY,
    ...TIME_STARTED_IMPLICIT_QUERIES,
    ...COMMON_IMPLICIT_QUERIES,
];

interface TerritoryControlFilterInterface {
    world?: World;
    zone?: Zone;
    timeStarted?: Record<string, unknown> | undefined;
    bracket?: Bracket;
    'result.victor'?: Faction | undefined;
}

@ApiTags('Instances')
@Controller('instances')
export class RestInstanceMetagameController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
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

    @Post('')
    @HttpCode(201)
    @ApiOperation({summary: 'INTERNAL: Create a metagame instance'})
    @ApiCreatedResponse({description: 'Record created'})
    @ApiBadRequestResponse({description: 'Bad request, check your data against the Dto object.'})
    @ApiUnauthorizedResponse({description: 'This is an internal PS2Alerts endpoint, you won\'t have access to this - ever.'})
    @ApiSecurity('basic')
    @UseGuards(AuthGuard('basic'))
    async createOne(
        @Body() entity: CreateInstanceMetagameDto,
    ): Promise<ObjectID> {
        return await this.mongoOperationsService.insertOne(InstanceMetagameTerritoryEntity, entity);
    }

    @Patch('/:instance')
    @HttpCode(202) // Can't use 204 as Axios doesn't like it
    @ApiOperation({summary: 'INTERNAL: Update a single metagame instance'})
    @ApiAcceptedResponse({description: 'Record updated'})
    @ApiBadRequestResponse({description: 'Bad request, check your data against the Dto object.'})
    @ApiUnauthorizedResponse({description: 'This is an internal PS2Alerts endpoint, you won\'t have access to this - ever.'})
    @ApiSecurity('basic')
    @UseGuards(AuthGuard('basic'))
    async patchOne(
        @Param('instance') instanceId: string,
            @Body() entity: UpdateInstanceMetagameDto,
    ): Promise<boolean> {
        return await this.mongoOperationsService.upsert(InstanceMetagameTerritoryEntity, [{$set: entity}], [{instanceId}]);
    }

    @Delete('/:instance')
    @ApiOperation({summary: 'INTERNAL: Delete a single metagame instance'})
    @ApiOkResponse({description: 'Record deleted'})
    @ApiUnauthorizedResponse({description: 'TFhis is an internal PS2Alerts endpoint, you won\'t have access to this - ever.'})
    @ApiSecurity('basic')
    @UseGuards(AuthGuard('basic'))
    async deleteOne(
        @Param('instance') instanceId: string,
    ): Promise<boolean> {
        return await this.mongoOperationsService.deleteOne(InstanceMetagameTerritoryEntity, {instanceId});
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
    ): Promise<InstanceMetagameTerritoryEntity[] | null> {
        const pagination = new Pagination({sortBy});
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const key = `/actives/W:${world}-Z:${zone}?P:${pagination.getKey()}`;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            await this.mongoOperationsService.findMany(
                InstanceMetagameTerritoryEntity,
                {
                    state: Ps2alertsEventState.STARTED,
                    world,
                    zone,
                },
                pagination,
            ),
            10);
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
            @Query('timeStartedFrom', OptionalDatePipe) timeStartedFrom?: Date | undefined,
            @Query('timeStartedTo', OptionalDatePipe) timeStartedTo?: Date | undefined,
            @Query('bracket', MandatoryIntPipe) bracket?: Bracket,
            @Query('victor', OptionalIntPipe) victor?: Faction,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceMetagameTerritoryEntity[]> {
        const range = (timeStartedFrom && timeStartedTo) ? new Range('timeStarted', timeStartedFrom, timeStartedTo).build() : undefined;
        const filter: TerritoryControlFilterInterface = {
            world,
            zone,
            bracket,
            timeStarted: range,
            'result.victor': victor ?? undefined,
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.mongoOperationsService.findMany(InstanceMetagameTerritoryEntity, filter, new Pagination({sortBy, order, page, pageSize}, false));
    }
}
