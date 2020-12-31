import {Controller, Get, Inject, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalVictoryAggregate from '../../../../data/entities/aggregate/global/global.victory.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {World} from '../../../../data/constants/world.consts';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {Zone} from '../../../../data/constants/zone.consts';
import {Bracket} from '../../../../data/constants/bracket.consts';
import {WORLD_IMPLICIT_QUERY} from '../../common/rest.world.query';
import {ZONE_IMPLICIT_QUERY} from '../../common/rest.zone.query';
import {BRACKET_IMPLICIT_QUERY} from '../../common/rest.bracket.query';

@ApiTags('Global Victory Aggregates')
@Controller('aggregates')
export default class RestGlobalVictoryAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get('global/victories')
    @ApiOperation({summary: 'Return a filtered list of GlobalVictoryAggregate aggregates'})
    @ApiImplicitQueries([WORLD_IMPLICIT_QUERY, ZONE_IMPLICIT_QUERY, BRACKET_IMPLICIT_QUERY])
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalVictoryAggregate aggregates',
        type: GlobalVictoryAggregate,
        isArray: true,
    })
    async findAll(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('zone', OptionalIntPipe) zone?: Zone,
            @Query('bracket', OptionalIntPipe) bracket?: Bracket,
    ): Promise<GlobalVictoryAggregate[]> {
        return await this.mongoOperationsService.findMany(GlobalVictoryAggregate, {world, zone, bracket});
    }
}
