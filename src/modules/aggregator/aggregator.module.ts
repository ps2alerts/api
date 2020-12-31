import {Module} from '@nestjs/common';
import {DataModule} from '../data/data.module';
// Global Aggregates
import AggregatorGlobalCharacterAggregateController from './controllers/aggregates/global/aggregator.global.character.aggregate.controller';
import AggregatorGlobalLoadoutAggregateController from './controllers/aggregates/global/aggregator.global.loadout.aggregate.controller';
import AggregatorGlobalFacilityControlAggregateController from './controllers/aggregates/global/aggregator.global.facility.control.aggregate.controller';
import AggregatorGlobalFactionCombatAggregateController from './controllers/aggregates/global/aggregator.global.faction.combat.aggregate.controller';
import AggregatorGlobalOutfitAggregateController from './controllers/aggregates/global/aggregator.global.outfit.aggregate.controller';
import AggregatorGlobalVehicleAggregateController from './controllers/aggregates/global/aggregator.global.vehicle.aggregate.controller';
import AggregatorGlobalVehicleCharacterAggregateController from './controllers/aggregates/global/aggregator.global.vehicle.character.aggregate.controller';
import AggregatorGlobalWeaponAggregateController from './controllers/aggregates/global/aggregator.global.weapon.aggregate.controller';
// Instance Aggregates
import AggregatorInstanceCharacterAggregateController from './controllers/aggregates/instance/aggregator.instance.character.aggregate.controller';
import AggregatorInstanceLoadoutAggregateController from './controllers/aggregates/instance/aggregator.instance.loadout.aggregate.controller';
import AggregatorInstanceFacilityControlAggregateController from './controllers/aggregates/instance/aggregator.instance.facility.control.aggregate.controller';
import AggregatorInstanceFactionCombatAggregateController from './controllers/aggregates/instance/aggregator.instance.faction.combat.aggregate.controller';
import AggregatorInstanceOutfitAggregateController from './controllers/aggregates/instance/aggregator.instance.outfit.aggregate.controller';
import AggregatorInstancePopulationAggregateController from './controllers/aggregates/instance/aggregator.instance.population.aggregate.controller';
import AggregatorInstanceVehicleAggregateController from './controllers/aggregates/instance/aggregator.instance.vehicle.aggregate.controller';
import AggregatorInstanceVehicleCharacterAggregateController from './controllers/aggregates/instance/aggregator.instance.vehicle.character.aggregate.controller';
import AggregatorGlobalVictoryAggregateController from './controllers/aggregates/global/aggregator.global.victory.aggregate.controller';
import AggregatorInstanceWeaponAggregateController from './controllers/aggregates/instance/aggregator.instance.weapon.aggregate.controller';
// Instance Event Controllers
import AggregatorInstanceDeathEventController from './controllers/events/aggregator.instance.death.event.controller';
import AggregatorInstanceFacilityControlEventController from './controllers/events/aggregator.instance.facility.control.event.controller';
// Other
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import AggregatorDataHandler from './aggregator.data.handler';

/**
 * This module processes the incoming messages from the PS2Alerts Aggregator component.
 */
@Module({
    imports: [
        DataModule,
    ],
    controllers: [
        // Global Aggregates
        AggregatorGlobalCharacterAggregateController,
        AggregatorGlobalLoadoutAggregateController,
        AggregatorGlobalFacilityControlAggregateController,
        AggregatorGlobalFactionCombatAggregateController,
        AggregatorGlobalOutfitAggregateController,
        AggregatorGlobalVehicleAggregateController,
        AggregatorGlobalVehicleCharacterAggregateController,
        AggregatorGlobalVictoryAggregateController,
        AggregatorGlobalWeaponAggregateController,
        // Instance Aggregates
        AggregatorInstanceCharacterAggregateController,
        AggregatorInstanceLoadoutAggregateController,
        AggregatorInstanceFacilityControlAggregateController,
        AggregatorInstanceFactionCombatAggregateController,
        AggregatorInstanceOutfitAggregateController,
        AggregatorInstancePopulationAggregateController,
        AggregatorInstanceVehicleAggregateController,
        AggregatorInstanceVehicleCharacterAggregateController,
        AggregatorInstanceWeaponAggregateController,
        // Instance Events
        AggregatorInstanceDeathEventController,
        AggregatorInstanceFacilityControlEventController,
        // METAGAME TODO
    ],
    providers: [
        AggregatorDataHandler,
        MongoOperationsService,
    ],
})
export class AggregatorModule {}
