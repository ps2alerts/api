import {BadRequestException, Controller, Get, Inject, Query} from '@nestjs/common';
import {ApiOperation, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';
import {RedisCacheService} from '../../../services/cache/redis.cache.service';
import GlobalCharacterAggregateEntity from '../../data/entities/aggregate/global/global.character.aggregate.entity';
import GlobalOutfitAggregateEntity from '../../data/entities/aggregate/global/global.outfit.aggregate.entity';
import {Bracket} from '../../data/ps2alerts-constants/bracket';
import {Ps2AlertsEventType} from '../../data/ps2alerts-constants/ps2AlertsEventType';
import {World} from '../../data/ps2alerts-constants/world';
import {OptionalIntPipe} from '../pipes/OptionalIntPipe';
import Pagination from '../../../services/mongo/pagination';

const SEARCH_QUERIES = [
    {name: 'searchTerm', required: true, type: String, description: 'Case insensitive prefix, 2-40 characters'},
    {name: 'world', required: false, type: Number},
    {name: 'pageSize', required: false, type: Number, description: 'Max results, default 20, capped at 50'},
];

// Prefix search over the lowercased searchName / searchTag fields kept up to date by SearchIndexCron.
// Results are sorted by the matched field, which naturally puts an exact match first; the website does the rest of the ranking.
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
    ) {}

    @Get('characters')
    @ApiOperation({summary: 'Searches characters whose name starts with the search term'})
    @ApiQuery(SEARCH_QUERIES[0])
    @ApiQuery(SEARCH_QUERIES[1])
    @ApiQuery(SEARCH_QUERIES[2])
    @ApiResponse({
        status: 200,
        description: 'Matching GlobalCharacterAggregateEntity records (bracket total, live metagame)',
        type: GlobalCharacterAggregateEntity,
        isArray: true,
    })
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

        const results = await this.prefixQuery<GlobalCharacterAggregateEntity>(GlobalCharacterAggregateEntity, 'searchName', term, limit, world);

        return await this.cacheService.set(key, results, this.cacheTtl);
    }

    @Get('outfits')
    @ApiOperation({summary: 'Searches outfits whose tag or name starts with the search term'})
    @ApiQuery(SEARCH_QUERIES[0])
    @ApiQuery(SEARCH_QUERIES[1])
    @ApiQuery(SEARCH_QUERIES[2])
    @ApiResponse({
        status: 200,
        description: 'Matching GlobalOutfitAggregateEntity records (bracket total, live metagame), tag matches first',
        type: GlobalOutfitAggregateEntity,
        isArray: true,
    })
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
            this.prefixQuery<GlobalOutfitAggregateEntity>(GlobalOutfitAggregateEntity, 'searchTag', term, limit, world),
            this.prefixQuery<GlobalOutfitAggregateEntity>(GlobalOutfitAggregateEntity, 'searchName', term, limit, world),
        ]);

        // Tag hits lead, then name hits, without repeating an outfit matched on both
        const seen = new Set<string>();
        const results = [...byTag, ...byName].filter((outfit) => {
            if (seen.has(outfit.outfit.id)) {
                return false;
            }

            seen.add(outfit.outfit.id);
            return true;
        }).slice(0, limit);

        return await this.cacheService.set(key, results, this.cacheTtl);
    }

    private normaliseTerm(searchTerm?: string): string {
        const term = (searchTerm ?? '').trim().toLowerCase();

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
        field: 'searchName' | 'searchTag',
        term: string,
        limit: number,
        world?: World,
    ): Promise<T[]> {
        // Anchored regex on an indexed field is an index range scan; escaping keeps user input from widening it
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        return await this.mongoOperationsService.findMany<T>(
            entity,
            {
                [field]: {$regex: `^${escaped}`},
                bracket: Bracket.TOTAL,
                ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME,
                world,
            },
            new Pagination({sortBy: field, order: 'asc', pageSize: limit}),
        );
    }
}
