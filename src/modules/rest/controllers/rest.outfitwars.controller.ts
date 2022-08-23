import {
    Body,
    ClassSerializerInterceptor,
    Controller, Delete,
    Get, HttpCode,
    Inject,
    Param, ParseIntPipe, Patch, Post,
    Query, UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiAcceptedResponse,
    ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOkResponse,
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
import {RESULT_VICTOR_QUERY} from './common/rest.result.victor.query';
import {RedisCacheService} from '../../../services/cache/redis.cache.service';
import {AuthGuard} from '@nestjs/passport';
import {ObjectID} from 'typeorm';
import InstanceOutfitWarsTerritoryEntity from '../../data/entities/instance/instance.outfitwars.territory.entity';
import {Team} from '../../data/ps2alerts-constants/outfitwars/team';
import {CreateInstanceOutfitWarsDto} from '../Dto/outfitwars/CreateInstanceOutfitWarsDto';
import {UpdateInstanceOutfitWarsDto} from '../Dto/outfitwars/UpdateInstanceOutfitWarsDto';
import {Phase} from '../../data/ps2alerts-constants/outfitwars/phase';
import {OUTFITWARS_IMPLICIT_QUERIES} from './common/rest.outfitwars.queries';
import {WORLD_IMPLICIT_QUERY} from './common/rest.world.query';
import {PAGINATION_IMPLICIT_QUERIES} from './common/rest.pagination.queries';
import {OptionalBoolPipe} from '../pipes/OptionalBoolPipe';
import {CreateFacilityControlDto} from '../Dto/CreateFacilityControlDto';
import {UpdateFacilityControlOutfitWarsDto} from '../Dto/outfitwars/UpdateFacilityControlOutfitWarsDto';
import OutfitwarsFacilityControlEntity from '../../data/entities/instance/outfitwars.facility.control.entity';
import {CreateFacilityControlOutfitWarsDto} from '../Dto/outfitwars/CreateFacilityControlOutfitWarsDto';
import GlobalOutfitAggregateEntity from '../../data/entities/aggregate/global/global.outfit.aggregate.entity';

const IMPLICIT_QUERIES = [
    WORLD_IMPLICIT_QUERY,
    RESULT_VICTOR_QUERY,
    ...PAGINATION_IMPLICIT_QUERIES,
    ...OUTFITWARS_IMPLICIT_QUERIES,
];

interface OutfitwarsFilterInterface {
    world?: World;
    phase?: Phase;
    round?: number;
    'result.victor'?: Team | undefined;
}

@ApiTags('Outfit Wars')
@Controller('outfit-wars')
export class RestOutfitwarsController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    @Get('/:instance')
    @ApiOperation({summary: 'Returns a single outfit wars instance'})
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
    @ApiOperation({summary: 'INTERNAL: Create a outfit wars instance'})
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
    @ApiOperation({summary: 'INTERNAL: Update a single outfit wars instance'})
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
    @ApiOperation({summary: 'INTERNAL: Delete a single outfit wars instance'})
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
    @ApiOperation({summary: 'Returns all currently running outfit wars instances, optionally requested by world'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'A list of active outfit wars instances',
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
        const key = `/actives/outfitwars/W:${world}-Z:${zone}`;

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

    @Get('/list')
    @ApiOperation({summary: 'Return a paginated list of outfit wars instances, optionally requested by world, phase, round or victor'})
    @ApiImplicitQueries(IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'List of OutfitWars Instances',
        type: InstanceOutfitWarsTerritoryEntity,
        isArray: true,
    })
    async findAllOutfitWars(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('phase', OptionalIntPipe) phase?: Phase,
            @Query('round', OptionalIntPipe) round?: number,
            @Query('victor', OptionalIntPipe) victor?: Team,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<InstanceOutfitWarsTerritoryEntity[]> {
        const filter: OutfitwarsFilterInterface = {
            world,
            phase,
            round,
            'result.victor': victor ?? undefined,
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.mongoOperationsService.findMany(InstanceOutfitWarsTerritoryEntity, filter, new Pagination({sortBy, order, page, pageSize}, false));
    }

    @Get(':instance/facility')
    @ApiOperation({summary: 'Returns a list of OutfitwarsFacilityControlEntity for an instance'})
    @ApiImplicitQueries([...PAGINATION_IMPLICIT_QUERIES, {
        name: 'noDefences',
        required: false,
        type: Boolean,
    }])
    @ApiResponse({
        status: 200,
        description: 'The list of OutfitwarsFacilityControlEntity for an instance',
        type: OutfitwarsFacilityControlEntity,
        isArray: true,
    })
    async findAll(
        @Param('instance') instance: string,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
            @Query('noDefences', OptionalBoolPipe) noDefences?: boolean | undefined,
    ): Promise<OutfitwarsFacilityControlEntity[]> {
        const filter = {instance} as {instance: string, isDefence?: boolean};

        if (noDefences) {
            filter.isDefence = false;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.mongoOperationsService.findMany(OutfitwarsFacilityControlEntity, filter, new Pagination({sortBy, order, page, pageSize}, false));
    }

    @Post(':instance/facility')
    @HttpCode(201)
    @ApiOperation({summary: 'INTERNAL: Store a OutfitwarsFacilityControlEntity for an instance'})
    @ApiCreatedResponse({description: 'Record created'})
    @ApiUnauthorizedResponse({description: 'This is an internal PS2Alerts endpoint, you won\'t have access to this - ever.'})
    @ApiBadRequestResponse({description: 'Bad request, check your data against the Dto object.'})
    @ApiSecurity('basic')
    @UseGuards(AuthGuard('basic'))
    async createOneInstanceFacility(
        @Param('instance') instance: string,
            @Body() entity: CreateFacilityControlOutfitWarsDto,
    ): Promise<void> {
        await this.mongoOperationsService.insertOne(OutfitwarsFacilityControlEntity, entity);
    }

    @Get(':instance/facility/:facility')
    @ApiOperation({summary: 'Returns the latest OutfitwarsFacilityControlEntity of an instance'})
    @ApiResponse({
        status: 200,
        description: 'The OutfitwarsFacilityControlEntity instance',
        type: OutfitwarsFacilityControlEntity,
    })
    async findOneInstanceFacility(
        @Param('instance') instance: string,
            @Param('facility', ParseIntPipe) facility: number,
    ): Promise<OutfitwarsFacilityControlEntity> {
        const pagination = new Pagination({sortBy: 'timestamp', order: 'desc'}, true);
        return await this.mongoOperationsService.findOne(OutfitwarsFacilityControlEntity, {instance, facility}, pagination);
    }

    @Patch(':instance/facility/:facility')
    @HttpCode(202) // Can't use 204 as Axios doesn't like it
    @ApiOperation({summary: 'INTERNAL: Update a OutfitwarsFacilityControlEntity for an instance, by latest record'})
    @ApiAcceptedResponse({description: 'Record updated'})
    @ApiUnauthorizedResponse({description: 'This is an internal PS2Alerts endpoint, you won\'t have access to this - ever.'})
    @ApiBadRequestResponse({description: 'Bad request, check your data against the Dto object.'})
    @ApiSecurity('basic')
    @UseGuards(AuthGuard('basic'))
    async patchOneInstanceFacility(
        @Param('instance') instance: string,
            @Param('facility', ParseIntPipe) facility: number,
            @Body() entity: UpdateFacilityControlOutfitWarsDto,
    ): Promise<void> {
        const record: OutfitwarsFacilityControlEntity = await this.findOneInstanceFacility(instance, facility);

        const updatedRecord = Object.assign(record, entity);

        // eslint-disable-next-line @typescript-eslint/naming-convention
        await this.mongoOperationsService.upsert(OutfitwarsFacilityControlEntity, [{$set: updatedRecord}], [{_id: updatedRecord._id}]);
    }

    @Post('facility/batch')
    @HttpCode(202)
    @ApiOperation({summary: 'INTERNAL: Store many InstanceFacilityControlEntities for an instance'})
    @ApiCreatedResponse({description: 'Records created'})
    @ApiUnauthorizedResponse({description: 'This is an internal PS2Alerts endpoint, you won\'t have access to this - ever.'})
    @ApiBadRequestResponse({description: 'Bad request, check your data against the Dto object.'})
    @ApiSecurity('basic')
    @UseGuards(AuthGuard('basic'))
    @ApiBody({type: [CreateFacilityControlDto]})
    async createManyInstanceFacility(
        @Body() entities: CreateFacilityControlDto[],
    ): Promise<ObjectID[]> {
        return await this.mongoOperationsService.insertMany(OutfitwarsFacilityControlEntity, entities);
    }
}
