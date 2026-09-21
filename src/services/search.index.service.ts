/* eslint-disable @typescript-eslint/naming-convention */
import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import MongoOperationsService from './mongo/mongo.operations.service';
import GlobalCharacterAggregateEntity from '../modules/data/entities/aggregate/global/global.character.aggregate.entity';
import GlobalOutfitAggregateEntity from '../modules/data/entities/aggregate/global/global.outfit.aggregate.entity';
import InstanceCharacterAggregateEntity from '../modules/data/entities/aggregate/instance/instance.character.aggregate.entity';
import InstanceOutfitAggregateEntity from '../modules/data/entities/aggregate/instance/instance.outfit.aggregate.entity';

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
}

// Indexes on the big global aggregates that must not be built inside TypeORM's synchronize, which blocks startup
export const MANAGED_INDEXES = {
    characterName: {
        entity: GlobalCharacterAggregateEntity,
        name: 'search_character_name_ci',
        keys: {bracket: 1, ps2AlertsEventType: 1, 'character.name': 1},
        collation: SEARCH_COLLATION,
    },
    outfitName: {
        entity: GlobalOutfitAggregateEntity,
        name: 'search_outfit_name_ci',
        keys: {bracket: 1, ps2AlertsEventType: 1, 'outfit.name': 1},
        collation: SEARCH_COLLATION,
    },
    outfitTag: {
        entity: GlobalOutfitAggregateEntity,
        name: 'search_outfit_tag_ci',
        keys: {bracket: 1, ps2AlertsEventType: 1, 'outfit.tag': 1},
        collation: SEARCH_COLLATION,
    },
    // World sits in every profile index so a world-scoped count is a pure index scan
    outfitMembers: {
        entity: GlobalCharacterAggregateEntity,
        name: 'profile_outfit_members_v2',
        keys: {bracket: 1, ps2AlertsEventType: 1, 'character.outfit.id': 1, world: 1, kills: -1},
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

// Earlier shapes of the indexes above, dropped once found so they stop costing writes
const RETIRED_INDEXES: Array<{entity: IndexedEntity, name: string}> = [
    {entity: GlobalCharacterAggregateEntity, name: 'profile_outfit_members'},
    {entity: InstanceCharacterAggregateEntity, name: 'profile_character_history'},
    {entity: InstanceOutfitAggregateEntity, name: 'profile_outfit_history'},
];

export type ManagedIndexName = keyof typeof MANAGED_INDEXES;

export const SEARCH_INDEXES: ManagedIndexName[] = ['characterName', 'outfitName', 'outfitTag'];

/**
 * Builds the indexes above in the background at startup, so a first deploy against millions of rows never blocks
 * boot. Endpoints ask whether the index they range-scan exists and answer 503 until it does. TypeORM cannot declare
 * collation, and it never drops indexes it did not create, so these are safe from synchronize either way.
 */
@Injectable()
export default class SearchIndexService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SearchIndexService.name);
    private readonly retryMs = 60 * 1000;
    private readonly ready = new Set<ManagedIndexName>();

    constructor(private readonly mongoOperationsService: MongoOperationsService) {}

    public isReady(names: ManagedIndexName[] = SEARCH_INDEXES): boolean {
        return names.every((name) => this.ready.has(name));
    }

    onApplicationBootstrap(): void {
        void this.ensureIndexes();
    }

    private async ensureIndexes(): Promise<void> {
        try {
            for (const retired of RETIRED_INDEXES) {
                const existing = await this.mongoOperationsService.em.collectionIndexes(retired.entity) as Array<{name: string}>;

                if (existing.some((candidate) => candidate.name === retired.name)) {
                    this.logger.log(`Dropping retired index ${retired.name}`);
                    await this.mongoOperationsService.em.dropCollectionIndex(retired.entity, retired.name);
                }
            }

            for (const [key, index] of Object.entries(MANAGED_INDEXES) as Array<[ManagedIndexName, ManagedIndex]>) {
                if (this.ready.has(key)) {
                    continue;
                }

                const existing = await this.mongoOperationsService.em.collectionIndexes(index.entity) as Array<{name: string}>;

                if (!existing.some((candidate) => candidate.name === index.name)) {
                    this.logger.log(`Building index ${index.name}, dependent endpoints stay unavailable until it finishes`);
                    const started = Date.now();

                    await this.mongoOperationsService.em.createCollectionIndex(
                        index.entity,
                        index.keys,
                        {name: index.name, ...(index.collation ? {collation: index.collation} : {})},
                    );

                    this.logger.log(`Built ${index.name} in ${Date.now() - started}ms`);
                }

                this.ready.add(key);
            }
        } catch (err) {
            // A transient failure (Mongo restarting, a clashing index being dropped) must not leave endpoints dead until the next deploy
            this.logger.error(`Index build failed, retrying in ${this.retryMs / 1000}s: ${String(err)}`);
            setTimeout(() => void this.ensureIndexes(), this.retryMs).unref();
        }
    }
}
