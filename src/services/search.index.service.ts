import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import MongoOperationsService from './mongo/mongo.operations.service';
import GlobalCharacterAggregateEntity from '../modules/data/entities/aggregate/global/global.character.aggregate.entity';
import GlobalOutfitAggregateEntity from '../modules/data/entities/aggregate/global/global.outfit.aggregate.entity';

export const SEARCH_COLLATION = {locale: 'en', strength: 2};

interface SearchIndex {
    entity: typeof GlobalCharacterAggregateEntity | typeof GlobalOutfitAggregateEntity;
    name: string;
    field: string;
}

export const SEARCH_INDEXES: Record<'characterName' | 'outfitName' | 'outfitTag', SearchIndex> = {
    characterName: {entity: GlobalCharacterAggregateEntity, name: 'search_character_name_ci', field: 'character.name'},
    outfitName: {entity: GlobalOutfitAggregateEntity, name: 'search_outfit_name_ci', field: 'outfit.name'},
    outfitTag: {entity: GlobalOutfitAggregateEntity, name: 'search_outfit_tag_ci', field: 'outfit.tag'},
};

/**
 * Owns the case-insensitive (collated) indexes the search endpoints range-scan. TypeORM cannot declare collation,
 * so they are created here, in the background, so that a first deploy against millions of rows never blocks startup.
 */
@Injectable()
export default class SearchIndexService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SearchIndexService.name);
    private readonly retryMs = 60 * 1000;
    private ready = false;

    constructor(private readonly mongoOperationsService: MongoOperationsService) {}

    public isReady(): boolean {
        return this.ready;
    }

    onApplicationBootstrap(): void {
        void this.ensureIndexes();
    }

    private async ensureIndexes(): Promise<void> {
        try {
            for (const index of Object.values(SEARCH_INDEXES)) {
                const existing = await this.mongoOperationsService.em.collectionIndexes(index.entity) as Array<{name: string}>;

                if (existing.some((candidate) => candidate.name === index.name)) {
                    continue;
                }

                this.logger.log(`Building search index ${index.name}, search stays unavailable until it finishes`);
                const started = Date.now();

                await this.mongoOperationsService.em.createCollectionIndex(
                    index.entity,
                    {bracket: 1, ps2AlertsEventType: 1, [index.field]: 1},
                    {name: index.name, collation: SEARCH_COLLATION},
                );

                this.logger.log(`Built ${index.name} in ${Date.now() - started}ms`);
            }

            this.ready = true;
        } catch (err) {
            // A transient failure (Mongo restarting, a clashing index being dropped) must not leave search dead until the next deploy
            this.logger.error(`Search index build failed, retrying in ${this.retryMs / 1000}s: ${String(err)}`);
            setTimeout(() => void this.ensureIndexes(), this.retryMs).unref();
        }
    }
}
