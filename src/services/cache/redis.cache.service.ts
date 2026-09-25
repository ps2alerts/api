import {CACHE_MANAGER, Inject, Injectable} from '@nestjs/common';
import {Cache} from 'cache-manager';
import {Counter} from 'prom-client';

// Bumped whenever a victory is recorded, so the cached victories responses stop matching at once.
export const GLOBAL_VICTORIES_GENERATION_KEY = '/global/victories/generation';

const lookups = new Counter({
    name: 'ps2alerts_api_cache_lookups_total',
    help: 'Redis cache lookups by key family and whether they hit',
    labelNames: ['family', 'result'],
});

// Keys are built in code as /family/<ids>/<filters>, so dropping IDs and filters leaves a small fixed set.
export function keyFamily(key: string): string {
    const kept: string[] = [];

    for (const segment of key.split('/').filter(Boolean)) {
        if (segment.includes(':') || segment.startsWith('?') || kept.length === 3) {
            break;
        }

        kept.push(/\d/.test(segment) ? ':id' : segment);
    }

    return `/${kept.join('/')}`;
}

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

        if (key !== GLOBAL_VICTORIES_GENERATION_KEY) {
            lookups.inc({family: keyFamily(key), result: data === null ? 'miss' : 'hit'});
        }

        return data ?? null;
    }
}
