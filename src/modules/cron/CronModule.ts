/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {CacheModule, Module} from '@nestjs/common';
import {CombatHistoryCron} from './combat.history.cron';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import InstanceMetagameTerritoryEntity from '../data/entities/instance/instance.metagame.territory.entity';
import InstanceFactionCombatAggregateEntity
    from '../data/entities/aggregate/instance/instance.faction.combat.aggregate.entity';
import InstanceCombatHistoryAggregateEntity
    from '../data/entities/aggregate/instance/instance.combat.history.aggregate.entity';
import {BracketCron} from './bracket.cron';
import ConfigModule from '../../config/config.module';
import {ConfigService} from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';
import {RedisCacheService} from '../../services/cache/redis.cache.service';
import {XpmCron} from './xpm.cron';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            InstanceCombatHistoryAggregateEntity,
            InstanceFactionCombatAggregateEntity,
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
        CombatHistoryCron,
        BracketCron,
        XpmCron,
    ],
})
export class CronModule {}
