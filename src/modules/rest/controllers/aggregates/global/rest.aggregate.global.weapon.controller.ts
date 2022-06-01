import {Controller, Get, Inject, Param, ParseIntPipe, Query} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalWeaponAggregateEntity from '../../../../data/entities/aggregate/global/global.weapon.aggregate.entity';
import MongoOperationsService from '../../../../../services/mongo/mongo.operations.service';
import {World} from '../../../../data/constants/world.consts';
import {OptionalIntPipe} from '../../../pipes/OptionalIntPipe';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {COMMON_IMPLICIT_QUERIES} from '../../common/rest.common.queries';
import Pagination from '../../../../../services/mongo/pagination';
import {Bracket} from '../../../../data/constants/bracket.consts';
import {RedisCacheService} from '../../../../../services/cache/redis.cache.service';
import {MandatoryIntPipe} from '../../../pipes/MandatoryIntPipe';

@ApiTags('Global Weapon Aggregates')
@Controller('aggregates')
export default class RestGlobalWeaponAggregateController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    @Get('global/weapon')
    @ApiOperation({summary: 'Return a filtered list of GlobalWeaponAggregateEntity aggregates'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalWeaponAggregateEntity aggregates',
        type: GlobalWeaponAggregateEntity,
        isArray: true,
    })
    async findAll(
        @Query('world', OptionalIntPipe) world?: World,
            @Query('bracket', MandatoryIntPipe) bracket?: Bracket,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalWeaponAggregateEntity[]> {
        const pagination = new Pagination({sortBy, order, page, pageSize}, false);
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const key = `/global/weapon/W:${world}-B:${bracket}?P:${pagination.getKey()}`;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            await this.mongoOperationsService.findMany(GlobalWeaponAggregateEntity, {world, bracket}, pagination),
            900);
    }

    @Get('global/weapon/:weapon')
    @ApiOperation({summary: 'Returns GlobalWeaponAggregateEntity aggregate(s) with given Id (or one of each world)'})
    @ApiImplicitQueries(COMMON_IMPLICIT_QUERIES)
    @ApiResponse({
        status: 200,
        description: 'The GlobalWeaponAggregateEntity aggregate(s)',
        type: GlobalWeaponAggregateEntity,
    })
    async findOne(
        @Param('weapon', ParseIntPipe) weapon: number,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalWeaponAggregateEntity | GlobalWeaponAggregateEntity[]> {
        return world
            ? await this.mongoOperationsService.findOne(GlobalWeaponAggregateEntity, {'weapon.id': weapon, world})
            : await this.mongoOperationsService.findMany(GlobalWeaponAggregateEntity, {'weapon.id': weapon}, new Pagination({sortBy, order, page, pageSize}, false));
    }
}
