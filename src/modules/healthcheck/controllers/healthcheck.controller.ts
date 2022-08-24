/* eslint-disable @typescript-eslint/explicit-function-return-type,@typescript-eslint/no-unsafe-assignment */
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Controller, Get, Inject, Logger} from '@nestjs/common';
import {
    HealthCheck, HealthCheckResult,
    HealthCheckService,
    MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import {DatabaseHealthIndicator} from '../indicators/DatabaseHealthIndicator';
import {RedisHealthIndicator} from '../indicators/RedisHealthIndicator';
import {Transport} from '@nestjs/microservices';
import {ConfigService} from '@nestjs/config';
import {CronHealthIndicator} from '../indicators/CronHealthIndicator';

@ApiTags('Healthcheck')
@Controller('healthcheck')
export default class HealthcheckController {
    private readonly logger = new Logger(HealthcheckController.name);

    constructor(
        @Inject(ConfigService) private readonly config: ConfigService,
        private readonly health: HealthCheckService,
        private readonly dbHealth: DatabaseHealthIndicator,
        private readonly redisHealth: RedisHealthIndicator,
        private readonly microserviceHealth: MicroserviceHealthIndicator,
        private readonly cronHealth: CronHealthIndicator,
    ) {}

    @Get('')
    @HealthCheck()
    @ApiOperation({summary: 'Runs health checks on the API service'})
    @ApiResponse({
        status: 200,
        description: 'Status of the healthcheck',
    })
    async check(): Promise<HealthCheckResult> {
        this.logger.debug('Running health check...');

        const indicators = [
            async () => this.redisHealth.isHealthy('healthcheck/test'),
        ];

        if (!process.env.TESTING_MODE && process.env.TESTING_MODE !== 'true') {
            indicators.push(async () => this.dbHealth.isHealthy('5428010618035323201'));
        }

        if (process.env.AGGREGATOR_ENABLED === 'true') {
            indicators.push(
                async () => this.microserviceHealth.pingCheck('rabbit', {
                    transport: Transport.RMQ,
                    options: {
                        urls: this.config.get('rabbitmq.url'),
                        queue: this.config.get('rabbitmq.queue'),
                        queueOptions: this.config.get('rabbitmq.queueOptions'),
                        noAck: this.config.get('rabbitmq.noAck'),
                        prefetchCount: this.config.get('rabbitmq.prefetchCount'),
                    },
                    timeout: 2000,
                }),
            );
        }

        if (process.env.CRON_ENABLED === 'true') {
            indicators.push(async () => this.cronHealth.isHealthy('brackets', 65));
            indicators.push(async () => this.cronHealth.isHealthy('combatHistory', 65));
            indicators.push(async () => this.cronHealth.isHealthy('xpm', 35));
        }

        return this.health.check(indicators);
    }
}
