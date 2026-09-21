/* eslint-disable @typescript-eslint/naming-convention */
import {Inject, Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {ObjectId} from 'typeorm';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import {RedisCacheService} from '../../services/cache/redis.cache.service';
import GlobalCharacterAggregateEntity from '../data/entities/aggregate/global/global.character.aggregate.entity';
import GlobalOutfitAggregateEntity from '../data/entities/aggregate/global/global.outfit.aggregate.entity';
import {Bracket} from '../data/ps2alerts-constants/bracket';
import {Ps2AlertsEventType} from '../data/ps2alerts-constants/ps2AlertsEventType';

interface SearchableRecord {
    _id: ObjectId;
    character?: {name: string};
    outfit?: {name: string, tag?: string | null};
}

// Keeps the lowercased searchName / searchTag fields populated so RestSearchController can do indexed prefix matches.
@Injectable()
export class SearchIndexCron {
    private readonly logger = new Logger(SearchIndexCron.name);
    private readonly batchSize = 5000;
    private readonly lockKey = 'locks:searchIndex';
    // Short and refreshed per batch, so a crashed run frees the lock in minutes rather than blocking indexing for an hour
    private readonly lockTtl = 120;
    private readonly healthKey = '/crons/search';
    private readonly healthTtl = 605;

    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron(): Promise<void> {
        if (await this.cacheService.get(this.lockKey)) {
            this.logger.debug('Search index job already running');
            return;
        }

        await this.cacheService.set(this.lockKey, Date.now(), this.lockTtl);

        try {
            await this.backfill(GlobalCharacterAggregateEntity, 'searchName', (record) => record.character?.name);
            await this.backfill(GlobalOutfitAggregateEntity, 'searchName', (record) => record.outfit?.name);
            await this.backfill(GlobalOutfitAggregateEntity, 'searchTag', (record) => record.outfit?.tag);
        } finally {
            await this.cacheService.del(this.lockKey);
        }

        await this.touchHealth();
    }

    // Names can change (character renames, outfit tag changes) so re-derive every field once a day.
    @Cron('0 30 4 * * *')
    async resync(): Promise<void> {
        this.logger.log('Resyncing search index fields');
        const filter = {bracket: Bracket.TOTAL, ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME};

        await this.mongoOperationsService.em.updateMany(
            GlobalCharacterAggregateEntity,
            {...filter, $expr: {$ne: ['$searchName', {$toLower: '$character.name'}]}},
            [{$set: {searchName: {$toLower: '$character.name'}}}],
        );
        await this.mongoOperationsService.em.updateMany(
            GlobalOutfitAggregateEntity,
            {...filter, $expr: {$ne: ['$searchName', {$toLower: '$outfit.name'}]}},
            [{$set: {searchName: {$toLower: '$outfit.name'}}}],
        );
        await this.mongoOperationsService.em.updateMany(
            GlobalOutfitAggregateEntity,
            {...filter, 'outfit.tag': {$type: 'string'}, $expr: {$ne: ['$searchTag', {$toLower: '$outfit.tag'}]}},
            [{$set: {searchTag: {$toLower: '$outfit.tag'}}}],
        );
    }

    private async backfill(
        entity: typeof GlobalCharacterAggregateEntity | typeof GlobalOutfitAggregateEntity,
        field: 'searchName' | 'searchTag',
        source: (record: SearchableRecord) => string | null | undefined,
    ): Promise<void> {
        const filter = {
            bracket: Bracket.TOTAL,
            ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME,
            [field]: {$exists: false},
        };
        let processed = 0;

        // Loop until a batch comes back short, touching the health key so a long first run isn't flagged as dead.
        for (;;) {
            const records: SearchableRecord[] = await this.mongoOperationsService.em.find(entity, {
                where: filter,
                take: this.batchSize,
                select: ['_id', 'character.name', 'outfit.name', 'outfit.tag'] as never,
            });

            if (records.length === 0) {
                break;
            }

            // Records with nothing to index (e.g. tagless outfits) get an explicit null so they leave the backlog.
            const operations = records.map((record) => ({
                updateOne: {
                    filter: {_id: record._id},
                    update: {$set: {[field]: source(record)?.toLowerCase() ?? null}},
                },
            }));

            await this.mongoOperationsService.em.bulkWrite(entity, operations, {ordered: false});
            processed += records.length;
            await this.touchHealth();

            if (records.length < this.batchSize) {
                break;
            }
        }

        if (processed > 0) {
            this.logger.log(`Indexed ${processed} ${entity.name} records for ${field}`);
        }
    }

    private async touchHealth(): Promise<void> {
        // @See CronHealthIndicator
        await this.cacheService.set(this.healthKey, Date.now(), this.healthTtl);
        await this.cacheService.set(this.lockKey, Date.now(), this.lockTtl);
    }
}
