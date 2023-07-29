import {Controller, Get, Inject, Optional, Query} from '@nestjs/common';
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {ApiImplicitQueries} from 'nestjs-swagger-api-implicit-queries-decorator';
import {PAGINATION_IMPLICIT_QUERIES} from './common/rest.pagination.queries';
import GlobalCharacterAggregateEntity from '../../data/entities/aggregate/global/global.character.aggregate.entity';
import GlobalOutfitAggregateEntity from '../../data/entities/aggregate/global/global.outfit.aggregate.entity';
import Pagination from '../../../services/mongo/pagination';
import {SearchTermInterface} from '../../../interfaces/SearchTermInterface';

@ApiTags('Search')
@Controller('search')
export default class RestSearchController {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Get()
    @ApiOperation({summary: 'Searches GlobalCharacterAggregateEntity and GlobalOutfitAggregateEntity for a term'})
    @ApiImplicitQueries([...PAGINATION_IMPLICIT_QUERIES, {
        name: 'type',
        required: false,
        description: 'The type of the data to be searched, either "characters" or "outfits". If not specified, both types will be searched.',
        type: String,
        enum: ['characters', 'outfits'],
    }])
    @ApiResponse({
        status: 200,
        description: 'The list of GlobalCharacterAggregateEntity and GlobalOutfitAggregateEntity for a search term',
        type: Object,
        isArray: false,
    })
    async search(
        @Query('searchTerm') searchTerm: string,
        @Query('type') @Optional() type?: string,
        @Query('sortBy') sortBy?: string,
        @Query('order') order?: string,
    ): Promise<{results: Array<GlobalCharacterAggregateEntity | GlobalOutfitAggregateEntity>}> {
        let characterResults: GlobalCharacterAggregateEntity[] = [];
        let outfitResults: GlobalOutfitAggregateEntity[] = [];

        const pagination = new Pagination({sortBy, order, page: 0, pageSize: 10}, false);

        if (type === 'characters' || type === undefined) {
            const characterSearchTerm: SearchTermInterface = {
                field: 'character.name',
                term: searchTerm,
                options: 'i',
            };
            characterResults = await this.mongoOperationsService.searchText(
                GlobalCharacterAggregateEntity,
                characterSearchTerm,
                {$and: [{bracket: 0}]},
                pagination,
            );
        }

        if (type === 'outfits' || type === undefined) {
            const outfitNameSearchTerm: SearchTermInterface = {
                field: 'outfit.name',
                term: searchTerm,
                options: 'i',
            };
            const outfitTagSearchTerm: SearchTermInterface = {
                field: 'outfit.tag',
                term: searchTerm,
                options: 'i',
            };

            // First, search for outfits by tag
            const outfitTagResults = await this.mongoOperationsService.searchText(
                GlobalOutfitAggregateEntity,
                outfitTagSearchTerm,
                {$and: [{bracket: 0}]},
                pagination,
            );

            const outfitNameResults = await this.mongoOperationsService.searchText(
                GlobalOutfitAggregateEntity,
                outfitNameSearchTerm,
                {$and: [{bracket: 0}]},
                pagination,
            );

            // Combine both arrays, ensuring that the tag results appear first
            outfitResults = [...outfitTagResults, ...outfitNameResults];

            // Deduplicate outfits based on name
            const outfitsMap = new Map(outfitResults.map((outfit) => [outfit.outfit.name, outfit]));
            outfitResults = Array.from(outfitsMap.values());
        }

        const searchTermLower = searchTerm.toLowerCase();

        // For outfits
        outfitResults.forEach((outfit) => {
            let score = 0;

            // Higher weight for exact matches on tag and name
            if (outfit.outfit.tag?.toLowerCase() === searchTermLower || outfit.outfit.name.toLowerCase() === searchTermLower) {
                score += 100;
            } else {
                // Lower weight for partial matches
                const searchTermRegex = new RegExp(searchTerm, 'i');

                if (outfit.outfit.tag?.match(searchTermRegex)) {
                    score += 20;
                } else if (outfit.outfit.name.match(searchTermRegex)) {
                    score += 10;
                }
            }

            outfit.searchScore = score;
            outfit.searchResultType = 'outfit'; // added type field
        });

        // For characters
        characterResults.forEach((character) => {
            let score = 0;

            // Higher weight for exact matches
            if (character.character.name.toLowerCase() === searchTermLower) {
                score += 100;
            } else {
                // Lower weight for partial matches
                const searchTermRegex = new RegExp(searchTerm, 'i');

                if (character.character.name.match(searchTermRegex)) {
                    score += 5;
                }
            }

            character.searchScore = score;
            character.searchResultType = 'character'; // added type field
        });

        // Sort by score
        characterResults.sort((a, b) => this.searchScores(a.searchScore, b.searchScore));

        // combine both arrays
        const results = [...characterResults, ...outfitResults].sort((a, b) => this.searchScores(a.searchScore, b.searchScore));

        return {results};
    }

    private searchScores(a: number | undefined, b: number | undefined): number {
        if (a && b) {
            return b - a;
        }

        return 0;
    }
}
