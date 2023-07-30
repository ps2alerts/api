/* eslint-disable @typescript-eslint/naming-convention */
import {Inject, Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import {RedisCacheService} from '../../services/cache/redis.cache.service';
import GlobalCharacterAggregateEntity from '../data/entities/aggregate/global/global.character.aggregate.entity';
import {Bracket} from '../data/ps2alerts-constants/bracket';
import Pagination from '../../services/mongo/pagination';
import GlobalOutfitAggregateEntity from '../data/entities/aggregate/global/global.outfit.aggregate.entity';
import {pcWorldArray, World} from '../data/ps2alerts-constants/world';
import {Ps2AlertsEventType} from '../data/ps2alerts-constants/ps2AlertsEventType';

@Injectable()
export class SearchCron {
    private readonly logger = new Logger(SearchCron.name);
    private readonly pageSize = 10000;
    private readonly listPrefix = 'search';
    private readonly filter = {searchIndexed: false, bracket: Bracket.TOTAL, ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME};

    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    @Cron(CronExpression.EVERY_5_SECONDS)
    async handleCron(): Promise<void> {
        this.logger.log('Running Search sync job');

        const lock = await this.cacheService.get('locks:search');

        if (lock) {
            this.logger.log('Search sync job already running');
            return;
        }

        await this.cacheService.set('locks:search', Date.now(), 60 * 60); // 1 hour lock

        await this.syncCharacters();
        await this.syncOutfits();

        await this.cacheService.unset('locks:search');

        // @See CronHealthIndicator
        // This sets the fact that the cron has run, so if it hasn't been run it will be terminated.
        const key = '/crons/search';
        await this.cacheService.set(key, Date.now(), 595); // Just under 5 minutes = deadline for this cron
        this.logger.debug('Set search cron run time');
    }

    async syncCharacters(): Promise<void> {
        this.logger.log('==== Syncing Characters ====');
        let page = 0;
        let endOfRecords = false;

        const numberOfRecords = await this.mongoOperationsService.countDocuments(GlobalCharacterAggregateEntity, this.filter);

        if (numberOfRecords === 0) {
            this.logger.log('No records to process');
            return;
        }

        this.logger.log(`Found ${numberOfRecords} records to add to search cache`);

        // Loop through all Character records until we have less than 1000 returned
        while (!endOfRecords) {
            this.logger.log(`Processing records ${page * this.pageSize} -> ${(page * this.pageSize) + (this.pageSize - 1)}...`);
            // Get all records that are not indexed
            const records: GlobalCharacterAggregateEntity[] = await this.mongoOperationsService.findMany(
                GlobalCharacterAggregateEntity,
                this.filter,
                new Pagination({page, pageSize: this.pageSize}), // We are purposefully NOT sorting here as it causes a full table scan and it's super fucking slow
            );

            if (records.length < this.pageSize) {
                endOfRecords = true;
                this.logger.log('At the end of character records');
            }

            // Loop through all records and add them to the cache
            for await (const record of records) {
                const environment = this.getEnvironment(record.world);

                // Store the lowercase version of the name acting as "normalized" for searching purposes
                await this.cacheService.addDataToSortedSet(`${this.listPrefix}:${environment}:character_index`, [record.character.name.toLowerCase()], 0);

                // Create a key which contains the lowercase name as the key and the char ID as the value, which will be used by the search API to pull the record out of the DB.
                // JSON.stringify is needed here as for some reason the client library favours using int64, this forces it to be a string
                await this.cacheService.setPermanent(`${this.listPrefix}:${environment}:character_ids:${record.character.name.toLowerCase()}`, JSON.stringify(record.character.id));

                // Mark the character as search indexed in the database to prevent being processed again
                await this.mongoOperationsService.upsert(GlobalCharacterAggregateEntity, [{$set: {searchIndexed: true}}], [{'character.id': record.character.id}]);
            }

            this.logger.log(`Added ${records.length} records to character search cache`);
            this.logger.log(`${page * this.pageSize + records.length}/${numberOfRecords} processed`);
            page++;
        }
    }

    async syncOutfits(): Promise<void> {
        this.logger.log('==== Syncing Outfits ====');
        let page = 0;
        let endOfRecords = false;
        let corruptOutfits = 0;

        const numberOfRecords = await this.mongoOperationsService.countDocuments(GlobalOutfitAggregateEntity, this.filter);

        if (numberOfRecords === 0) {
            this.logger.log('No records to process');
            return;
        }

        this.logger.log(`Found ${numberOfRecords} records to add to search cache`);

        // Loop through all Character records until we have less than 1000 returned
        while (!endOfRecords) {
            this.logger.log(`Processing records ${page * this.pageSize} -> ${(page * this.pageSize) + (this.pageSize - 1)}...`);

            // Get all records that are not indexed
            const records: GlobalOutfitAggregateEntity[] = await this.mongoOperationsService.findMany(
                GlobalOutfitAggregateEntity,
                this.filter,
                new Pagination({page, pageSize: this.pageSize}), // We are purposefully NOT sorting here as it causes a full table scan and it's super fucking slow
            );

            if (records.length < this.pageSize) {
                endOfRecords = true;
                this.logger.log('At the end of outfit records');
            }

            // Loop through all records and add them to the cache
            for await (const record of records) {
                const environment = this.getEnvironment(record.world);

                // Handle outfit corruptions that come up occasionally
                if (!record.outfit.name || !record.outfit.id) {
                    this.logger.error('Corrupt outfit detected!');
                    corruptOutfits++;

                    try {
                        await this.mongoOperationsService.deleteOne(GlobalOutfitAggregateEntity, {_id: record._id});
                    } catch (err) {
                        this.logger.error(err);
                    }

                    continue;
                }

                await this.cacheService.addDataToSortedSet(`${this.listPrefix}:${environment}:outfit_index`, [record.outfit.name.toLowerCase()]);

                if (record.outfit.tag) {
                    await this.cacheService.addDataToSortedSet(`${this.listPrefix}:${environment}:outfit_tag_index`, [record.outfit.tag.toLowerCase()]);
                }

                // Create a key which contains the lowercase name as the key and the outfit ID as the value, which will be used by the search API to pull the record out of the DB
                // JSON.stringify is needed here as for some reason the client library favours using int64, this forces it to be a string
                await this.cacheService.setPermanent(`${this.listPrefix}:${environment}:outfit_ids:${record.outfit.name.toLowerCase()}`, JSON.stringify(record.outfit.id));

                // Do the same for tag if it exists
                if (record.outfit.tag) {
                    await this.cacheService.setPermanent(`${this.listPrefix}:${environment}:outfit_ids_tag:${record.outfit.tag.toLowerCase()}`, JSON.stringify(record.outfit.id));
                }

                // Mark the character as search indexed in the database
                await this.mongoOperationsService.upsert(GlobalOutfitAggregateEntity, [{$set: {searchIndexed: true}}], [{'outfit.id': record.outfit.id}]);
            }

            this.logger.log(`Added ${records.length} records to outfit search cache`);
            this.logger.log(`${page * this.pageSize + records.length}/${numberOfRecords} processed`);
            this.logger.error(`Corrupt outfits: ${corruptOutfits}`);

            page++;
        }
    }

    getEnvironment(world: World): string {
        if (pcWorldArray.includes(world)) {
            return 'pc';
        } else if (world === World.CERES) {
            return 'ps4_eu';
        } else {
            return 'ps4_us';
        }

        return 'UNKNOWN';
    }
}
