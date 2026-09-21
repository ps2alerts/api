import {BadRequestException, Controller, Get, Inject, Query, ServiceUnavailableException} from '@nestjs/common';
import {ApiOperation, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';
import {RedisCacheService} from '../../../services/cache/redis.cache.service';
import SearchIndexService, {SEARCH_COLLATION, SEARCH_INDEXES} from '../../../services/search.index.service';
import GlobalCharacterAggregateEntity from '../../data/entities/aggregate/global/global.character.aggregate.entity';
import GlobalOutfitAggregateEntity from '../../data/entities/aggregate/global/global.outfit.aggregate.entity';
import {Bracket} from '../../data/ps2alerts-constants/bracket';
import {Ps2AlertsEventType} from '../../data/ps2alerts-constants/ps2AlertsEventType';
import {World} from '../../data/ps2alerts-constants/world';
import {OptionalIntPipe} from '../pipes/OptionalIntPipe';

const SEARCH_QUERIES = [
    {name: 'searchTerm', required: true, type: String, description: 'Case insensitive prefix, 2-40 characters'},
    {name: 'world', required: false, type: Number},
    {name: 'pageSize', required: false, type: Number, description: 'Max results, default 20, capped at 50'},
];

/**
 * Prefix search straight against the names on the global aggregates. The collated indexes make a plain range query
 * case-insensitive, so nothing is copied or maintained: an index range scan of at most `pageSize` keys per query.
 * Results come back in collated name order, which puts an exact match first; the website does the rest of the ranking.
 */
@ApiTags('Search')
@Controller('search')
export default class RestSearchController {
    private readonly cacheTtl = 60 * 5;
    private readonly minLength = 2;
    private readonly maxLength = 40;
    private readonly defaultPageSize = 20;
    private readonly maxPageSize = 50;

    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
        private readonly searchIndexService: SearchIndexService,
    ) {}

    @Get('characters')
    @ApiOperation({summary: 'Searches characters whose name starts with the search term'})
    @ApiQuery(SEARCH_QUERIES[0])
    @ApiQuery(SEARCH_QUERIES[1])
    @ApiQuery(SEARCH_QUERIES[2])
    @ApiResponse({status: 200, description: 'Matching GlobalCharacterAggregateEntity records (bracket total, live metagame)', type: GlobalCharacterAggregateEntity, isArray: true})
    @ApiResponse({status: 503, description: 'The search index is still being built'})
    async searchCharacters(
        @Query('searchTerm') searchTerm: string,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalCharacterAggregateEntity[]> {
        const term = this.normaliseTerm(searchTerm);
        const limit = this.limit(pageSize);
        const key = `cache:search:characters:${world ?? 0}:${limit}:${term}`;

        const cached = await this.cacheService.get<GlobalCharacterAggregateEntity[]>(key);

        if (cached) {
            return cached;
        }

        const results = await this.prefixQuery<GlobalCharacterAggregateEntity>(GlobalCharacterAggregateEntity, SEARCH_INDEXES.characterName.field, term, limit, world);

        return await this.cacheService.set(key, results, this.cacheTtl);
    }

    @Get('outfits')
    @ApiOperation({summary: 'Searches outfits whose tag or name starts with the search term'})
    @ApiQuery(SEARCH_QUERIES[0])
    @ApiQuery(SEARCH_QUERIES[1])
    @ApiQuery(SEARCH_QUERIES[2])
    @ApiResponse({status: 200, description: 'Matching GlobalOutfitAggregateEntity records (bracket total, live metagame), tag matches first', type: GlobalOutfitAggregateEntity, isArray: true})
    @ApiResponse({status: 503, description: 'The search index is still being built'})
    async searchOutfits(
        @Query('searchTerm') searchTerm: string,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
    ): Promise<GlobalOutfitAggregateEntity[]> {
        const term = this.normaliseTerm(searchTerm);
        const limit = this.limit(pageSize);
        const key = `cache:search:outfits:${world ?? 0}:${limit}:${term}`;

        const cached = await this.cacheService.get<GlobalOutfitAggregateEntity[]>(key);

        if (cached) {
            return cached;
        }

        const [byTag, byName] = await Promise.all([
            this.prefixQuery<GlobalOutfitAggregateEntity>(GlobalOutfitAggregateEntity, SEARCH_INDEXES.outfitTag.field, term, limit, world),
            this.prefixQuery<GlobalOutfitAggregateEntity>(GlobalOutfitAggregateEntity, SEARCH_INDEXES.outfitName.field, term, limit, world),
        ]);

        // Tag hits lead, then name hits. The same id can legitimately exist on more than one world, so dedupe on both.
        const seen = new Set<string>();
        const results = [...byTag, ...byName].filter((outfit) => {
            const identity = `${outfit.outfit.id}:${outfit.world}`;

            if (seen.has(identity)) {
                return false;
            }

            seen.add(identity);
            return true;
        }).slice(0, limit);

        return await this.cacheService.set(key, results, this.cacheTtl);
    }

    private normaliseTerm(searchTerm?: string): string {
        const term = (searchTerm ?? '').trim();

        if (term.length < this.minLength || term.length > this.maxLength) {
            throw new BadRequestException(`searchTerm must be between ${this.minLength} and ${this.maxLength} characters`);
        }

        return term;
    }

    private limit(pageSize?: number): number {
        if (!pageSize || pageSize < 1) {
            return this.defaultPageSize;
        }

        return Math.min(pageSize, this.maxPageSize);
    }

    private async prefixQuery<T>(
        entity: typeof GlobalCharacterAggregateEntity | typeof GlobalOutfitAggregateEntity,
        field: string,
        term: string,
        limit: number,
        world?: World,
    ): Promise<T[]> {
        if (!this.searchIndexService.isReady()) {
            throw new ServiceUnavailableException('Search is unavailable while its index is being built');
        }

        // Under a strength-2 collation this range is case-insensitive and stays within the index; U+FFFF caps the prefix
        const match: Record<string, unknown> = {
            bracket: Bracket.TOTAL,
            ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME,
            [field]: {$gte: term, $lt: `${term}￿`},
        };

        if (world) {
            match.world = world;
        }

        return await this.mongoOperationsService.aggregate<T>(
            entity,
            [
                {$match: match},
                {$sort: {[field]: 1}},
                {$limit: limit},
                {$project: {_id: 0}},
            ],
            {collation: SEARCH_COLLATION},
        );
    }
}
