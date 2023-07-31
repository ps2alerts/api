import {Inject, Injectable} from '@nestjs/common';
import MongoOperationsService from './mongo/mongo.operations.service';
import {RedisCacheService} from './cache/redis.cache.service';
import InstanceMetagameTerritoryEntity from '../modules/data/entities/instance/instance.metagame.territory.entity';

// This service purely grabs the instances out of the database and caches them in a consistent manner.
@Injectable()
export default class InstanceRetrievalService {
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    public async findOne(instanceId: string): Promise<InstanceMetagameTerritoryEntity> {
        const key = `cache:instances:${instanceId}`;

        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            await this.mongoOperationsService.findOne(
                InstanceMetagameTerritoryEntity,
                {instanceId},
            ),
            60 * 60 * 24 * 7,
        );
    }
}
