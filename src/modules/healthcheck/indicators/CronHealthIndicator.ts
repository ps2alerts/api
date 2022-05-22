import {Injectable} from '@nestjs/common';
import {HealthCheckError, HealthIndicator, HealthIndicatorResult} from '@nestjs/terminus';
import {RedisCacheService} from '../../../services/cache/redis.cache.service';

@Injectable()
export class CronHealthIndicator extends HealthIndicator {
    constructor(
        private readonly cacheService: RedisCacheService,
    ) {
        super();
    }

    // Checks if the cron has been run recently, depending on set TTL as determined by the bracket controller.
    // If there's no redis key, it's potentially not been run yet so mark it as "healthy" and wait for deadline.
    async isHealthy(cron: string, deadline: number): Promise<HealthIndicatorResult> {
        const key = `/crons/${cron}`;
        const deadlineKey = `/healthcheck/deadlines${key}`;
        const result: string|null = await this.cacheService.get(key) ?? null;
        let deadlineTime: string|null = await this.cacheService.get(deadlineKey) ?? null;

        if (result) {
            return this.getStatus(cron, true, [`Cron "${cron}" has been run recently`]);
        }

        // If there's no result and no deadline time set, set one now
        if (!deadlineTime) {
            deadlineTime = String(Date.now() + (deadline * 1000));
            await this.cacheService.set(deadlineKey, deadlineTime, deadline + 30); // 30s to ensure it doesn't reset before it checks again, this should be enough time to kill the pod and restart
        }

        // If there's still no result and deadline is set, check if it's within deadline, if not the cron hasn't run and it's unhealthy
        if (deadlineTime) {
            const difference = Date.now() - parseInt(deadlineTime, 10);

            if (difference < 0) {
                return this.getStatus(cron, true, [`Cron "${cron}" is possibly still warming up and hasn't run yet, and has yet to exceed deadline.`]);
            }
        }

        throw new HealthCheckError(cron, this.getStatus(cron, false, [`Cron "${cron}" is unhealthy, it has exceeded deadline of ${deadline}s!`]));
    }
}
