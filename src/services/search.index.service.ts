/* eslint-disable @typescript-eslint/naming-convention */
import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import MongoOperationsService from './mongo/mongo.operations.service';
import GlobalCharacterAggregateEntity from '../modules/data/entities/aggregate/global/global.character.aggregate.entity';
import GlobalOutfitAggregateEntity from '../modules/data/entities/aggregate/global/global.outfit.aggregate.entity';
import InstanceCharacterAggregateEntity from '../modules/data/entities/aggregate/instance/instance.character.aggregate.entity';
import InstanceOutfitAggregateEntity from '../modules/data/entities/aggregate/instance/instance.outfit.aggregate.entity';
import {Bracket} from '../modules/data/ps2alerts-constants/bracket';
import {Ps2AlertsEventType} from '../modules/data/ps2alerts-constants/ps2AlertsEventType';

export const SEARCH_COLLATION = {locale: 'en', strength: 2};

type IndexedEntity =
    | typeof GlobalCharacterAggregateEntity
    | typeof GlobalOutfitAggregateEntity
    | typeof InstanceCharacterAggregateEntity
    | typeof InstanceOutfitAggregateEntity;

interface ManagedIndex {
    entity: IndexedEntity;
    name: string;
    keys: Record<string, 1 | -1>;
    collation?: typeof SEARCH_COLLATION;
    partialFilterExpression?: Record<string, unknown>;
}

// Search and members only read bracket-total live rows, about a third of each global collection
const TOTAL_LIVE_ONLY = {bracket: Bracket.TOTAL, ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME};

// Indexes on the big global aggregates that must not be built inside TypeORM's synchronize, which blocks startup
export const MANAGED_INDEXES = {
    characterName: {
        entity: GlobalCharacterAggregateEntity,
        name: 'search_character_name_ci_v2',
        keys: {'character.name': 1, world: 1},
        collation: SEARCH_COLLATION,
        partialFilterExpression: TOTAL_LIVE_ONLY,
    },
    outfitName: {
        entity: GlobalOutfitAggregateEntity,
        name: 'search_outfit_name_ci_v2',
        keys: {'outfit.name': 1, world: 1},
        collation: SEARCH_COLLATION,
        partialFilterExpression: TOTAL_LIVE_ONLY,
    },
    outfitTag: {
        entity: GlobalOutfitAggregateEntity,
        name: 'search_outfit_tag_ci_v2',
        keys: {'outfit.tag': 1, world: 1},
        collation: SEARCH_COLLATION,
        partialFilterExpression: TOTAL_LIVE_ONLY,
    },
    // World sits in every profile index so a world-scoped count is a pure index scan
    outfitMembers: {
        entity: GlobalCharacterAggregateEntity,
        name: 'profile_outfit_members_v3',
        keys: {'character.outfit.id': 1, world: 1, kills: -1},
        partialFilterExpression: TOTAL_LIVE_ONLY,
    },
    // Alert history pages default to newest first; instance ids sort chronologically within a world
    characterHistory: {
        entity: InstanceCharacterAggregateEntity,
        name: 'profile_character_history_v2',
        keys: {'character.id': 1, ps2AlertsEventType: 1, 'character.world': 1, instance: -1},
    },
    outfitHistory: {
        entity: InstanceOutfitAggregateEntity,
        name: 'profile_outfit_history_v2',
        keys: {'outfit.id': 1, ps2AlertsEventType: 1, 'outfit.world': 1, instance: -1},
    },
} as const satisfies Record<string, ManagedIndex>;

export type ManagedIndexName = keyof typeof MANAGED_INDEXES;

export const SEARCH_INDEXES: ManagedIndexName[] = ['characterName', 'outfitName', 'outfitTag'];

/**
 * Builds the indexes above in the background at startup, so a first deploy against millions of rows never blocks
 * boot. Endpoints answer 503 until the index they scan exists. INDEX_BUILDS_ENABLED=false stops the builds and
 * only watches for indexes built by hand. Nothing here ever drops an index.
 */
@Injectable()
export default class SearchIndexService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SearchIndexService.name);
    private readonly retryMs = 60 * 1000;
    private readonly ready = new Set<ManagedIndexName>();
    private readonly buildsEnabled = process.env.INDEX_BUILDS_ENABLED !== 'false';

    constructor(private readonly mongoOperationsService: MongoOperationsService) {}

    public isReady(names: ManagedIndexName[] = SEARCH_INDEXES): boolean {
        return names.every((name) => this.ready.has(name));
    }

    onApplicationBootstrap(): void {
        void this.ensureIndexes();
    }

    private async ensureIndexes(): Promise<void> {
        let pending = false;

        try {
            for (const [key, index] of Object.entries(MANAGED_INDEXES) as Array<[ManagedIndexName, ManagedIndex]>) {
                if (this.ready.has(key)) {
                    continue;
                }

                const existing = await this.mongoOperationsService.em.collectionIndexes(index.entity) as Array<{name: string}>;

                if (!existing.some((candidate) => candidate.name === index.name)) {
                    if (!this.buildsEnabled) {
                        pending = true;
                        continue;
                    }

                    this.logger.log(`Building index ${index.name}, dependent endpoints stay unavailable until it finishes`);
                    const started = Date.now();

                    await this.mongoOperationsService.em.createCollectionIndex(
                        index.entity,
                        index.keys,
                        {
                            name: index.name,
                            ...(index.collation ? {collation: index.collation} : {}),
                            ...(index.partialFilterExpression ? {partialFilterExpression: index.partialFilterExpression} : {}),
                        },
                    );

                    this.logger.log(`Built ${index.name} in ${Date.now() - started}ms`);
                }

                this.ready.add(key);
            }

            if (pending) {
                this.logger.warn(`Index builds are disabled and some managed indexes are missing, checking again in ${this.retryMs / 1000}s`);
                setTimeout(() => void this.ensureIndexes(), this.retryMs).unref();
            }

        } catch (err) {
            // A transient failure (Mongo restarting, a clashing index being dropped) must not leave endpoints dead until the next deploy
            this.logger.error(`Index build failed, retrying in ${this.retryMs / 1000}s: ${String(err)}`);
            setTimeout(() => void this.ensureIndexes(), this.retryMs).unref();
        }
    }
}
