import {Inject, Injectable} from '@nestjs/common';
import MongoOperationsService from './mongo/mongo.operations.service';
import {RedisCacheService} from './cache/redis.cache.service';
import InstanceMetagameTerritoryEntity from '../modules/data/entities/instance/instance.metagame.territory.entity';
import {Ps2AlertsEventState} from '../modules/data/ps2alerts-constants/ps2AlertsEventState';
import {ObjectLiteral} from 'typeorm';

// Grabs instances out of the database and caches the finished ones, which never change again.
@Injectable()
export default class InstanceRetrievalService {
    private readonly batchSize = 1000;

    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    public async findOne(instanceId: string): Promise<InstanceMetagameTerritoryEntity | ObjectLiteral> {
        const key = `cache:instances:${instanceId}`;

        const data = await this.cacheService.get(key);

        if (data) {
            return data;
        }

        const instance = await this.mongoOperationsService.findOne(
            InstanceMetagameTerritoryEntity,
            {instanceId},
        );

        if (instance.state !== Ps2AlertsEventState.ENDED) {
            return instance;
        }

        return await this.cacheService.set(key, instance, 60 * 60 * 24 * 7);
    }

    // Attaches instanceDetails to each per-instance aggregate (e.g. a character's or outfit's alert history).
    // Fetched in bulk: an outfit can have tens of thousands of alerts, so one lookup per alert is far too slow.
    public async hydrate<T extends {instance: string, instanceDetails?: ObjectLiteral}>(aggregates: T[]): Promise<T[]> {
        const instanceIds = [...new Set(aggregates.map((aggregate) => aggregate.instance))];
        const instances = new Map<string, InstanceMetagameTerritoryEntity>();

        for (let i = 0; i < instanceIds.length; i += this.batchSize) {
            const batch: InstanceMetagameTerritoryEntity[] = await this.mongoOperationsService.findMany(
                InstanceMetagameTerritoryEntity,
                {instanceId: {$in: instanceIds.slice(i, i + this.batchSize)}},
            );
            batch.forEach((instance) => instances.set(instance.instanceId, instance));
        }

        // Aggregates can outlive a purged instance, in which case the details are simply left off
        aggregates.forEach((aggregate) => {
            aggregate.instanceDetails = instances.get(aggregate.instance);
        });

        return aggregates;
    }
}
