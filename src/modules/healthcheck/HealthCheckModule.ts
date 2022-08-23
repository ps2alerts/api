/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {CacheModule, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import InstanceMetagameTerritoryEntity from '../data/entities/instance/instance.metagame.territory.entity';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import {RedisCacheService} from '../../services/cache/redis.cache.service';
import ConfigModule from '../../config/config.module';
import {ConfigService} from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';
import GlobalCharacterAggregateEntity from '../data/entities/aggregate/global/global.character.aggregate.entity';
import HealthcheckController from './controllers/healthcheck.controller';
import {TerminusModule} from '@nestjs/terminus';
import {DatabaseHealthIndicator} from './indicators/DatabaseHealthIndicator';
import {RedisHealthIndicator} from './indicators/RedisHealthIndicator';
import {CronHealthIndicator} from './indicators/CronHealthIndicator';

const metadata = {
    controllers: [
        HealthcheckController,
    ],
    imports: [
        ConfigService,
        TerminusModule,
        TypeOrmModule.forFeature([
            GlobalCharacterAggregateEntity,
            InstanceMetagameTerritoryEntity,
        ]),
        CacheModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                return {
                    store: redisStore,
                    host: config.get('redis.host'),
                    port: config.get('redis.port'),
                    db: config.get('redis.db'),
                    password: config.get('redis.password'),
                };
            },
        }),
    ],
    providers: [
        MongoOperationsService,
        RedisCacheService,
        DatabaseHealthIndicator,
        RedisHealthIndicator,
    ],
};

if (process.env.CRON_ENABLED === 'true') {
    // Don't be so bloody stupid TS! It's a fecking array!!
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    metadata.providers.push(CronHealthIndicator);
}

@Module(metadata)
export class HealthCheckModule {}
