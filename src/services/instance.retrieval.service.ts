import {Inject, Injectable} from '@nestjs/common';
import MongoOperationsService from './mongo/mongo.operations.service';
import {RedisCacheService} from './cache/redis.cache.service';
import InstanceMetagameTerritoryEntity from '../modules/data/entities/instance/instance.metagame.territory.entity';
import {Ps2AlertsEventState} from '../modules/data/ps2alerts-constants/ps2AlertsEventState';
import {ObjectLiteral} from 'typeorm';

// Grabs instances out of the database and caches the finished ones, which never change again.
@Injectable()
export default class InstanceRetrievalService {
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

    // Attaches instanceDetails to each per-instance aggregate (e.g. a character's or outfit's alert history)
    public async hydrate<T extends {instance: string, instanceDetails?: ObjectLiteral}>(aggregates: T[]): Promise<T[]> {
        for (const aggregate of aggregates) {
            try {
                aggregate.instanceDetails = await this.findOne(aggregate.instance);
            } catch (err) {
                // Aggregates can outlive a purged instance; leave the details off rather than fail the whole list
                aggregate.instanceDetails = undefined;
            }
        }

        return aggregates;
    }
}
