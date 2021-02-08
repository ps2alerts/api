import {CACHE_MANAGER, Inject, Injectable} from '@nestjs/common';
import {Cache} from 'cache-manager';

@Injectable()
export class RedisCacheService {

    constructor(
        @Inject(CACHE_MANAGER) private readonly cache: Cache,
    ) {}

    async set<T>(key: string, data: T, ttl = 3600): Promise<T> {
        await this.cache.set(key, data, {ttl});
        return data;
    }

    async get<T>(key: string): Promise<T | null> {
        const data: T | null = await this.cache.get(key) ?? null;
        return data ?? null;
    }
}
