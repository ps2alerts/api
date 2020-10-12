
import {APP_INTERCEPTOR} from '@nestjs/core';
import {ClassSerializerInterceptor, Module} from '@nestjs/common';
import {RestInstanceMetagameController} from './controllers/rest.instance.metagame.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
// Global Aggregate Entities
import GlobalCharacterAggregateEntity from '../data/entities/aggregate/global/global.character.aggregate.entity';
import GlobalClassAggregateEntity from '../data/entities/aggregate/global/global.class.aggregate.entity';
import GlobalFacilityControlAggregateEntity from '../data/entities/aggregate/global/global.facility.control.aggregate.entity';
import GlobalFactionCombatAggregateEntity from '../data/entities/aggregate/global/global.faction.combat.aggregate.entity';
import GlobalOutfitAggregateEntity from '../data/entities/aggregate/global/global.outfit.aggregate.entity';
import GlobalVehicleAggregateEntity from '../data/entities/aggregate/global/global.vehicle.aggregate.entity';
import GlobalWeaponAggregateEntity from '../data/entities/aggregate/global/global.weapon.aggregate.entity';
// Instance Aggregate Entities
import InstanceCharacterAggregateEntity from '../data/entities/aggregate/instance/instance.character.aggregate.entity';
import InstanceClassAggregateEntity from '../data/entities/aggregate/instance/instance.class.aggregate.entity';
import InstanceFacilityControlAggregateEntity from '../data/entities/aggregate/instance/instance.facility.control.aggregate.entity';
import InstanceFactionCombatAggregateEntity from '../data/entities/aggregate/instance/instance.faction.combat.aggregate.entity';
import InstanceOutfitAggregateEntity from '../data/entities/aggregate/instance/instance.outfit.aggregate.entity';
import InstancePopulationAggregateEntity from '../data/entities/aggregate/instance/instance.population.aggregate.entity';
import InstanceVehicleAggregateEntity from '../data/entities/aggregate/instance/instance.vehicle.aggregate.entity';
import InstanceWeaponAggregateEntity from '../data/entities/aggregate/instance/instance.weapon.aggregate.entity';
import InstanceMetagameTerritoryEntity from '../data/entities/instance/instance.metagame.territory.entity';
// REST Global Aggregate Controllers
import RestGlobalClassAggregateController from './controllers/aggregates/global/rest.aggregate.global.class.controller';
import RestGlobalCharacterAggregateController from './controllers/aggregates/global/rest.aggregate.global.character.controller';
import RestGlobalFactionCombatAggregateController from './controllers/aggregates/global/rest.aggregate.global.faction.combat.controller';
import RestGlobalOutfitAggregateController from './controllers/aggregates/global/rest.aggregate.global.outfit.controller';
import RestGlobalVehicleAggregateController from './controllers/aggregates/global/rest.aggregate.global.vehicle.controller';
import RestGlobalWeaponAggregateController from './controllers/aggregates/global/rest.aggregate.global.weapon.controller';
import RestGlobalFacilityControlAggregateController from './controllers/aggregates/global/rest.aggregate.global.facility.control.controller';
// REST Instance Aggregate Controllers
import RestInstanceCharacterAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.character.controller';
import RestInstanceClassAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.class.controller';
import RestInstanceFacilityControlAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.facility.control.controller';
import RestInstanceFactionCombatAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.faction.combat.controller';
import RestInstanceOutfitAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.outfit.controller';
import RestInstanceVehicleAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.vehicle.controller';
import RestInstanceWeaponAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.weapon.controller';
import RestInstancePopulationAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.population.controller';
// Others
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import InstanceFacilityControlEntity from '../data/entities/instance/instance.facilitycontrol.entity';
import RestInstanceFacilityControlController from './controllers/rest.instance.facility.control.controller';

/**
 * Handles incoming requests to the API via HTTP, CRUD environment.
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([
            // Global Aggregate Entities
            GlobalCharacterAggregateEntity,
            GlobalClassAggregateEntity,
            GlobalFacilityControlAggregateEntity,
            GlobalFactionCombatAggregateEntity,
            GlobalOutfitAggregateEntity,
            GlobalVehicleAggregateEntity,
            GlobalWeaponAggregateEntity,
            // Instance Aggregate Entities
            InstanceCharacterAggregateEntity,
            InstanceClassAggregateEntity,
            InstanceFacilityControlAggregateEntity,
            InstanceFactionCombatAggregateEntity,
            InstanceOutfitAggregateEntity,
            InstancePopulationAggregateEntity,
            InstanceVehicleAggregateEntity,
            InstanceWeaponAggregateEntity,
            // Instance Event Entities
            InstanceFacilityControlEntity,
            InstanceMetagameTerritoryEntity,
        ]),
    ],
    controllers: [
        // Global Aggregate Controllers
        RestGlobalCharacterAggregateController,
        RestGlobalClassAggregateController,
        RestGlobalFacilityControlAggregateController,
        RestGlobalFactionCombatAggregateController,
        RestGlobalOutfitAggregateController,
        RestGlobalVehicleAggregateController,
        RestGlobalWeaponAggregateController,
        // Instance Aggregate Controllers
        RestInstanceCharacterAggregateController,
        RestInstanceClassAggregateController,
        RestInstanceFacilityControlAggregateController,
        RestInstanceFactionCombatAggregateController,
        RestInstanceOutfitAggregateController,
        RestInstancePopulationAggregateController,
        RestInstanceVehicleAggregateController,
        RestInstanceWeaponAggregateController,
        // Instance Event Controllers
        RestInstanceMetagameController,
        RestInstanceFacilityControlController,
    ],
    providers: [
        {provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor},
        MongoOperationsService,
    ],
})
export class RestModule {}
