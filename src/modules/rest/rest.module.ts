/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {APP_INTERCEPTOR} from '@nestjs/core';
import {CacheModule, ClassSerializerInterceptor, Module} from '@nestjs/common';
import {RestInstanceMetagameController} from './controllers/rest.instance.metagame.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
// Global Aggregate Entities
import GlobalCharacterAggregateEntity from '../data/entities/aggregate/global/global.character.aggregate.entity';
import GlobalFacilityControlAggregateEntity from '../data/entities/aggregate/global/global.facility.control.aggregate.entity';
import GlobalFactionCombatAggregateEntity from '../data/entities/aggregate/global/global.faction.combat.aggregate.entity';
import GlobalLoadoutAggregateEntity from '../data/entities/aggregate/global/global.loadout.aggregate.entity';
import GlobalOutfitAggregateEntity from '../data/entities/aggregate/global/global.outfit.aggregate.entity';
import GlobalVehicleAggregateEntity from '../data/entities/aggregate/global/global.vehicle.aggregate.entity';
import GlobalVehicleCharacterAggregateEntity from '../data/entities/aggregate/global/global.vehicle.character.aggregate.entity';
import GlobalWeaponAggregateEntity from '../data/entities/aggregate/global/global.weapon.aggregate.entity';
// Instance Aggregate Entities
import InstanceCharacterAggregateEntity from '../data/entities/aggregate/instance/instance.character.aggregate.entity';
import InstanceCombatHistoryAggregateEntity from '../data/entities/aggregate/instance/instance.combat.history.aggregate.entity';
import InstanceFacilityControlAggregateEntity from '../data/entities/aggregate/instance/instance.facility.control.aggregate.entity';
import InstanceFactionCombatAggregateEntity from '../data/entities/aggregate/instance/instance.faction.combat.aggregate.entity';
import InstanceLoadoutAggregateEntity from '../data/entities/aggregate/instance/instance.loadout.aggregate.entity';
import InstanceMetagameTerritoryEntity from '../data/entities/instance/instance.metagame.territory.entity';
import InstanceOutfitAggregateEntity from '../data/entities/aggregate/instance/instance.outfit.aggregate.entity';
import InstancePopulationAggregateEntity from '../data/entities/aggregate/instance/instance.population.aggregate.entity';
import InstancePopulationAveragesAggregateEntity from '../data/entities/aggregate/instance/instance.population.averages.aggregate.entity';
import InstanceVehicleAggregateEntity from '../data/entities/aggregate/instance/instance.vehicle.aggregate.entity';
import InstanceVehicleCharacterAggregateEntity from '../data/entities/aggregate/instance/instance.vehicle.character.aggregate.entity';
import InstanceWeaponAggregateEntity from '../data/entities/aggregate/instance/instance.weapon.aggregate.entity';
// REST Global Aggregate Controllers
import RestGlobalCharacterAggregateController from './controllers/aggregates/global/rest.aggregate.global.character.controller';
import RestGlobalFacilityControlAggregateController from './controllers/aggregates/global/rest.aggregate.global.facility.control.controller';
import RestGlobalFactionCombatAggregateController from './controllers/aggregates/global/rest.aggregate.global.faction.combat.controller';
import RestGlobalLoadoutAggregateController from './controllers/aggregates/global/rest.aggregate.global.loadout.controller';
import RestGlobalOutfitAggregateController from './controllers/aggregates/global/rest.aggregate.global.outfit.controller';
import RestGlobalVehicleAggregateController from './controllers/aggregates/global/rest.aggregate.global.vehicle.controller';
import RestGlobalVehicleCharacterAggregateController from './controllers/aggregates/global/rest.aggregate.global.vehicle.character.controller';
import RestGlobalVictoryAggregateController from './controllers/aggregates/global/rest.aggregate.global.victory.controller';
import RestGlobalWeaponAggregateController from './controllers/aggregates/global/rest.aggregate.global.weapon.controller';
// REST Instance Aggregate Controllers
import RestInstanceCharacterAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.character.controller';
import RestInstanceCombatHistoryAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.combat.history.controller';
import RestInstanceFacilityControlAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.facility.control.controller';
import RestInstanceFactionCombatAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.faction.combat.controller';
import RestInstanceLoadoutAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.loadout.controller';
import RestInstanceOutfitAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.outfit.controller';
import RestInstancePopulationAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.population.controller';
import RestInstancePopulationAggregateAveragesController from './controllers/aggregates/instance/rest.aggregate.instance.population.averages.controller';
import RestInstanceVehicleAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.vehicle.controller';
import RestInstanceVehicleCharacterAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.vehicle.character.controller';
import RestInstanceWeaponAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.weapon.controller';
// Census
import RestCensusOshurPolyfillController from './controllers/census/rest.census.oshur.polyfill.controller';
// Others
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import InstanceFacilityControlEntity from '../data/entities/instance/instance.facilitycontrol.entity';
import RestInstanceFacilityControlController from './controllers/rest.instance.facility.control.controller';
import ConfigModule from '../../config/config.module';
import {ConfigService} from '@nestjs/config';
import * as redisStore from 'cache-manager-ioredis';
import {RedisCacheService} from '../../services/cache/redis.cache.service';
import {AuthModule} from '../../auth/auth.module';

/**
 * Handles incoming requests to the API via HTTP, CRUD environment.
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([
            // Global Aggregate Entities
            GlobalCharacterAggregateEntity,
            GlobalFacilityControlAggregateEntity,
            GlobalFactionCombatAggregateEntity,
            GlobalLoadoutAggregateEntity,
            GlobalOutfitAggregateEntity,
            GlobalVehicleAggregateEntity,
            GlobalVehicleCharacterAggregateEntity,
            GlobalWeaponAggregateEntity,
            // Instance Aggregate Entities
            InstanceCharacterAggregateEntity,
            InstanceCombatHistoryAggregateEntity,
            InstanceFacilityControlAggregateEntity,
            InstanceFactionCombatAggregateEntity,
            InstanceLoadoutAggregateEntity,
            InstanceOutfitAggregateEntity,
            InstancePopulationAggregateEntity,
            InstancePopulationAveragesAggregateEntity,
            InstanceVehicleAggregateEntity,
            InstanceVehicleCharacterAggregateEntity,
            InstanceWeaponAggregateEntity,
            // Instance Event Entities
            InstanceFacilityControlEntity,
            InstanceMetagameTerritoryEntity,
        ]),
        // This cannot be registered globally so we have to do it in submodules :( https://github.com/nestjs/nest/issues/1633#issuecomment-472605111
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
        AuthModule,
    ],
    controllers: [
        // Global Aggregate Controllers
        RestGlobalCharacterAggregateController,
        RestGlobalFacilityControlAggregateController,
        RestGlobalFactionCombatAggregateController,
        RestGlobalLoadoutAggregateController,
        RestGlobalOutfitAggregateController,
        RestGlobalVehicleAggregateController,
        RestGlobalVehicleCharacterAggregateController,
        RestGlobalVictoryAggregateController,
        RestGlobalWeaponAggregateController,
        // Instance Aggregate Controllers
        RestInstanceCharacterAggregateController,
        RestInstanceCombatHistoryAggregateController,
        RestInstanceFacilityControlAggregateController,
        RestInstanceFactionCombatAggregateController,
        RestInstanceLoadoutAggregateController,
        RestInstanceOutfitAggregateController,
        RestInstancePopulationAggregateController,
        RestInstancePopulationAggregateAveragesController,
        RestInstanceVehicleAggregateController,
        RestInstanceVehicleCharacterAggregateController,
        RestInstanceWeaponAggregateController,
        // Census polyfills
        RestCensusOshurPolyfillController,
        // Instance Event Controllers
        RestInstanceFacilityControlController,
        RestInstanceMetagameController,
    ],
    providers: [
        {provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor},
        MongoOperationsService,
        RedisCacheService,
    ],
})
export class RestModule {}
