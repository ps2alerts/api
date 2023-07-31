import {Inject, Injectable} from '@nestjs/common';
import MongoOperationsService from './mongo/mongo.operations.service';
import {RedisCacheService} from './cache/redis.cache.service';
import InstanceMetagameTerritoryEntity from '../modules/data/entities/instance/instance.metagame.territory.entity';
import {Ps2AlertsEventState} from '../modules/data/ps2alerts-constants/ps2AlertsEventState';
import {ObjectLiteral} from 'typeorm';

// This service purely grabs the instances out of the database and caches them in a consistent manner.
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

        // If alert is not complete yet, don't cache it
        if (instance.state !== Ps2AlertsEventState.ENDED) {
            return instance;
        } else {
            return await this.cacheService.set(key, instance, 60 * 60 * 24 * 7);
        }
    }
}
