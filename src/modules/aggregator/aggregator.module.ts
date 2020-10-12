import {Module} from '@nestjs/common';
import {DataModule} from '../data/data.module';
import AggregatorGlobalCharacterAggregateController from './controllers/aggregates/global/aggregator.global.character.aggregate.controller';
import AggregatorGlobalClassAggregateController from './controllers/aggregates/global/aggregator.global.class.aggregate.controller';
import AggregatorGlobalFacilityControlAggregateController from './controllers/aggregates/global/aggregator.global.facility.control.aggregate.controller';
import AggregatorGlobalFactionCombatAggregateController from './controllers/aggregates/global/aggregator.global.faction.combat.aggregate.controller';
import AggregatorGlobalOutfitAggregateController from './controllers/aggregates/global/aggregator.global.outfit.aggregate.controller';
import AggregatorGlobalVehicleAggregateController from './controllers/aggregates/global/aggregator.global.vehicle.aggregate.controller';
import AggregatorGlobalWeaponAggregateController from './controllers/aggregates/global/aggregator.global.weapon.aggregate.controller';
import AggregatorInstanceCharacterAggregateController from './controllers/aggregates/instance/aggregator.instance.character.aggregate.controller';
import AggregatorInstanceClassAggregateController from './controllers/aggregates/instance/aggregator.instance.class.aggregate.controller';
import AggregatorInstanceFacilityControlAggregateController from './controllers/aggregates/instance/aggregator.instance.facility.control.aggregate.controller';
import AggregatorInstanceFactionCombatAggregateController from './controllers/aggregates/instance/aggregator.instance.faction.combat.aggregate.controller';
import AggregatorInstanceOutfitAggregateController from './controllers/aggregates/instance/aggregator.instance.outfit.aggregate.controller';
import AggregatorInstancePopulationAggregateController from './controllers/aggregates/instance/aggregator.instance.population.aggregate.controller';
import AggregatorInstanceVehicleAggregateController from './controllers/aggregates/instance/aggregator.instance.vehicle.aggregate.controller';
import AggregatorInstanceWeaponAggregateController from './controllers/aggregates/instance/aggregator.instance.weapon.aggregate.controller';
import AggregatorInstanceDeathEventController from './controllers/events/aggregator.instance.death.event.controller';
import AggregatorInstanceFacilityControlEventController from './controllers/events/aggregator.instance.facility.control.event.controller';
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
        AggregatorGlobalClassAggregateController,
        AggregatorGlobalFacilityControlAggregateController,
        AggregatorGlobalFactionCombatAggregateController,
        AggregatorGlobalOutfitAggregateController,
        AggregatorGlobalVehicleAggregateController,
        AggregatorGlobalWeaponAggregateController,
        // Instance Aggregates
        AggregatorInstanceCharacterAggregateController,
        AggregatorInstanceClassAggregateController,
        AggregatorInstanceFacilityControlAggregateController,
        AggregatorInstanceFactionCombatAggregateController,
        AggregatorInstanceOutfitAggregateController,
        AggregatorInstancePopulationAggregateController,
        AggregatorInstanceVehicleAggregateController,
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
