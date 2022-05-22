import {Injectable} from '@nestjs/common';
import {HealthCheckError, HealthIndicator, HealthIndicatorResult} from '@nestjs/terminus';
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
        await this.cacheService.set(key, 'successful', 2);
        const result: string = await this.cacheService.get(key) ?? 'oops';

        if (result === 'oops') {
            throw new HealthCheckError('redis', this.getStatus('redis', false, ['Redis could not create or read a key']));
        }

        return this.getStatus('redis', true, ['Redis is healthy']);
    }
}
