import {Controller, Get, Inject, Query} from '@nestjs/common';
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import GlobalCharacterAggregateEntity from '../../data/entities/aggregate/global/global.character.aggregate.entity';
import GlobalOutfitAggregateEntity from '../../data/entities/aggregate/global/global.outfit.aggregate.entity';
import {Ps2AlertsEventType} from '../../data/ps2alerts-constants/ps2AlertsEventType';
import {RedisCacheService} from '../../../services/cache/redis.cache.service';
import {Bracket} from '../../data/ps2alerts-constants/bracket';

@ApiTags('Search')
@Controller('search')
export default class RestSearchController {
    private readonly environments = ['pc', 'ps4_eu', 'ps4_us'];
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    @Get('characters')
    @ApiOperation({summary: 'Searches GlobalCharacterAggregateEntity for a term'})
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalCharacterAggregateEntity for a search term',
        type: Object,
        isArray: true,
    })
    async searchCharacters(
        @Query('searchTerm') searchTerm: string,
    ): Promise<GlobalCharacterAggregateEntity[]> {
        // Time for some voodoo
        const characterIds: string[] = [];

        // Loop through each environment and perform a prefix search via Redis using an insensitive version of the search term. This will return the names of the characters that match the search term.
        for (const environment of this.environments) {
            const nameListKey = `search:${environment}:character_index`;
            const characterNames = await this.cacheService.searchDataInSortedSet(nameListKey, searchTerm.toLowerCase());

            // Now we have the character names, we need to grab their IDs by performing a lookup by lowercase name in the database
            for (const characterName of characterNames) {
                characterIds.push(String(await this.cacheService.get(`search:${environment}:character_ids:${characterName}`)));
            }
        }

        // Now we have a list of character IDs to grab, we now need to actually grab the characters from the database
        return await this.mongoOperationsService.findMany(GlobalCharacterAggregateEntity, {
            'character.id': {$in: characterIds},
            bracket: Bracket.TOTAL,
            ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME,
        });
    }

    @Get('outfits')
    @ApiOperation({summary: 'Searches GlobalOutfitAggregateEntity for a term'})
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalOutfitAggregateEntity for a search term',
        type: Object,
        isArray: false,
    })
    async searchOutfits(
        @Query('searchTerm') searchTerm: string,
    ): Promise<GlobalOutfitAggregateEntity[]> {
        // Time for some extra voodoo
        let outfitIds: string[] = [];

        // Loop through each environment and perform a prefix search via Redis using an insensitive version of the search term. This will return the names of the outfits that match the search term.
        for (const environment of this.environments) {
            const nameListKey = `search:${environment}:outfit_index`;
            const tagListKey = `search:${environment}:outfit_tag_index`;
            const outfitNames = await this.cacheService.searchDataInSortedSet(nameListKey, searchTerm.toLowerCase());
            const outfitTags = await this.cacheService.searchDataInSortedSet(tagListKey, searchTerm.toLowerCase());

            // Now we have the character names, we need to grab their IDs by performing a lookup by lowercase name in the database
            for (const outfitName of outfitNames) {
                outfitIds.push(
                    String(await this.cacheService.get(`search:${environment}:outfit_ids:${outfitName}`)),
                );
            }

            // We also need to search on outfit tag for possible hits
            for (const outfitTag of outfitTags) {
                outfitIds.push(
                    String(await this.cacheService.get(`search:${environment}:outfit_ids_tag:${outfitTag}`)),
                );
            }
        }

        // Deduplicate the outfit IDs
        const outfitIdsSet = new Set(outfitIds);
        outfitIds = Array.from(outfitIdsSet);

        // Now we have a list of character IDs to grab, we now need to actually grab the characters from the database
        return await this.mongoOperationsService.findMany(GlobalOutfitAggregateEntity, {
            'outfit.id': {$in: outfitIds},
            bracket: Bracket.TOTAL,
            ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME,
        });
    }
}
