import {Injectable} from '@nestjs/common';
import {HealthIndicator, HealthIndicatorResult} from '@nestjs/terminus';
import {RedisCacheService} from '../../../services/cache/redis.cache.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
    constructor(
        private readonly cacheService: RedisCacheService,
    ) {
        super();
    }

    async isHealthy(key: string): Promise<HealthIndicatorResult> {
        // Check Redis is alive
        await this.cacheService.set(key, 'successful', 1);
        const result: string = await this.cacheService.get(key) ?? 'oops';

        if (result === 'oops') {
            throw new Error('Redis is unhealthy, result didn\'t return back correctly.');
        }

        return this.getStatus('redis', true, [result]);
    }
}
