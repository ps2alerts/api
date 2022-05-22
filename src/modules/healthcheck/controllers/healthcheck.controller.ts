/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {Controller, Get, Inject, Logger} from '@nestjs/common';
import MongoOperationsService from '../../../services/mongo/mongo.operations.service';
import {
    HealthCheck, HealthCheckResult,
    HealthCheckService,
    MicroserviceHealthIndicator,
} from '@nestjs/terminus';
import {DatabaseHealthIndicator} from '../indicators/DatabaseHealthIndicator';
import {RedisHealthIndicator} from '../indicators/RedisHealthIndicator';
import {Transport} from '@nestjs/microservices';
import {ConfigService} from '@nestjs/config';

@ApiTags('Healthcheck')
@Controller('healthcheck')
export default class HealthcheckController {
    private readonly logger = new Logger(HealthcheckController.name);

    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        @Inject(ConfigService) private readonly config: ConfigService,
        private readonly health: HealthCheckService,
        private readonly dbHealth: DatabaseHealthIndicator,
        private readonly redisHealth: RedisHealthIndicator,
        private readonly microserviceHealth: MicroserviceHealthIndicator,
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
            async () => this.dbHealth.isHealthy('5428010618035323201'),
            async () => this.redisHealth.isHealthy('healthcheck/test'),
        ];

        if (process.env.AGGREGATOR_ENABLED === 'true') {
            indicators.push(
                async () => this.microserviceHealth.pingCheck('rabbit', {
                    transport: Transport.TCP,
                    options: {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        host: this.config.get('rabbitmq.url'),
                    },

                }),
            );
        }

        // Check if API is accessible via http
        return this.health.check(indicators);
    }
}
