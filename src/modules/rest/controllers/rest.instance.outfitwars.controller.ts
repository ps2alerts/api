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
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';
import {Ps2alertsEventState} from '../../data/ps2alerts-constants/ps2alertsEventState';
import {OptionalIntPipe} from '../pipes/OptionalIntPipe';
import {World} from '../../data/ps2alerts-constants/world';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import Pagination from '../../../services/mongo/pagination';
import {COMMON_IMPLICIT_QUERIES} from './common/rest.common.queries';
import {Zone} from '../../data/ps2alerts-constants/zone';
import {TIME_STARTED_IMPLICIT_QUERIES} from './common/rest.time.started.query';
import {OptionalDatePipe} from '../pipes/OptionalDatePipe';
import Range from '../../../services/mongo/range';
import {Bracket} from '../../data/ps2alerts-constants/bracket';
import {BRACKET_IMPLICIT_QUERY} from './common/rest.bracket.query';
import {RESULT_VICTOR_QUERY} from './common/rest.result.victor.query';
//import {Faction} from '../../data/ps2alerts-constants/faction';
import {RedisCacheService} from '../../../services/cache/redis.cache.service';
import {AuthGuard} from '@nestjs/passport';
import {ObjectID} from 'typeorm';
import InstanceOutfitWarsTerritoryEntity from '../../data/entities/instance/instance.outfitwars.territory.entity';
import { Team } from '../../data/ps2alerts-constants/outfitwars/team';
import { CreateInstanceOutfitWarsDto } from '../Dto/CreateInstanceOutfitWarsDto';
import { UpdateInstanceOutfitWarsDto } from '../Dto/UpdateInstanceOutfitWarsDto';

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
    'result.victor'?: Team | undefined;
}

@ApiTags('Outfit Wars')
@Controller('outfit-wars')
export class RestInstanceOutfitWarsController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    @Get('/:instance')
    @ApiOperation({summary: 'Returns a single metagame instance'})
    @ApiResponse({
        status: 200,
        description: 'The Metagame Instance',
        type: InstanceOutfitWarsTerritoryEntity,
    })
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(@Param('instance') instanceId: string): Promise<InstanceOutfitWarsTerritoryEntity> {
        return await this.mongoOperationsService.findOne(
            InstanceOutfitWarsTerritoryEntity,
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
        @Body() entity: CreateInstanceOutfitWarsDto,
    ): Promise<ObjectID> {
        return await this.mongoOperationsService.insertOne(InstanceOutfitWarsTerritoryEntity, entity);
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
            @Body() entity: UpdateInstanceOutfitWarsDto,
    ): Promise<boolean> {
        return await this.mongoOperationsService.upsert(InstanceOutfitWarsTerritoryEntity, [{$set: entity}], [{instanceId}]);
    }

    @Delete('/:instance')
    @ApiOperation({summary: 'INTERNAL: Delete a single metagame instance'})
    @ApiOkResponse({description: 'Record deleted'})
    @ApiUnauthorizedResponse({description: 'This is an internal PS2Alerts endpoint, you won\'t have access to this - ever.'})
    @ApiSecurity('basic')
    @UseGuards(AuthGuard('basic'))
    async deleteOne(
        @Param('instance') instanceId: string,
    ): Promise<boolean> {
        return await this.mongoOperationsService.deleteOne(InstanceOutfitWarsTerritoryEntity, {instanceId});
    }

    @Get('/active')
    @ApiOperation({summary: 'Returns all currently running metagame instances, optionally requested by world'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'A list of active metagame instances',
        type: InstanceOutfitWarsTerritoryEntity,
        isArray: true,
    })
    @UseInterceptors(ClassSerializerInterceptor)
    async findActives(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('zone', OptionalIntPipe) zone?: Zone,
            @Query('sortBy') sortBy?: string,
    ): Promise<InstanceOutfitWarsTerritoryEntity[] | null> {
        const pagination = new Pagination({sortBy});
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const key = `/actives/W:${world}-Z:${zone}?P:${pagination.getKey()}`;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            await this.mongoOperationsService.findMany(
                InstanceOutfitWarsTerritoryEntity,
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
        type: InstanceOutfitWarsTerritoryEntity,
        isArray: true,
    })
    async findAllTerritoryControl(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('zone', OptionalIntPipe) zone?: Zone,
            @Query('timeStartedFrom', OptionalDatePipe) timeStartedFrom?: Date | undefined,
            @Query('timeStartedTo', OptionalDatePipe) timeStartedTo?: Date | undefined,
            @Query('bracket', OptionalIntPipe) bracket?: Bracket,
            @Query('victor', OptionalIntPipe) victor?: Team,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceOutfitWarsTerritoryEntity[]> {
        const range = (timeStartedFrom && timeStartedTo) ? new Range('timeStarted', timeStartedFrom, timeStartedTo).build() : undefined;
        const filter: TerritoryControlFilterInterface = {
            world,
            zone,
            bracket,
            timeStarted: range,
            'result.victor': victor ?? undefined,
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.mongoOperationsService.findMany(InstanceOutfitWarsTerritoryEntity, filter, new Pagination({sortBy, order, page, pageSize}, false));
    }
}
