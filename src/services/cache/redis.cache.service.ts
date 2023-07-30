import {CACHE_MANAGER, Inject, Injectable} from '@nestjs/common';
import {Cache} from 'cache-manager';
import * as Redis from 'ioredis';

@Injectable()
export class RedisCacheService {
    private readonly redisClient: Redis.Redis;

    constructor(
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
    ) {
        // Yay for packages that don't have full support for TS >:(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
        this.redisClient = (this.cache.store as any).getClient() as Redis.Redis;
    }

    async set<T>(key: string, data: T, ttl = 3600): Promise<T> {
        await this.cache.set(key, data, {ttl});
        return data;
    }

    async setPermanent(key: string, data: string): Promise<string> {
        await this.redisClient.set(key, data);
        return data;
    }

    async unset(key: string): Promise<void> {
        await this.cache.del(key);
    }

    async get<T>(key: string): Promise<T | null> {
        const data: T | null = await this.cache.get(key) ?? null;
        return data ?? null;
    }

    async addDataToSortedSet(key: string, data: string[], score = 0): Promise<void> {
        // Flattening array of [score, data] pairs
        const args: Array<number | string> = data.reduce<Array<number | string>>((arr, item) => [...arr, score, item], []);
        await this.redisClient.zadd(key, ...args);
    }

    async searchDataInSortedSet(key: string, prefix: string): Promise<string[]> {
        return this.redisClient.zrangebylex(key, `[${prefix}`, `[${prefix}\xff`);
    }
}
