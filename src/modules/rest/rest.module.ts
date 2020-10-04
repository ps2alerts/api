
import {APP_INTERCEPTOR} from '@nestjs/core';
import {ClassSerializerInterceptor, Module} from '@nestjs/common';
import {RestInstanceController} from './controllers/rest.instance.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import GlobalCharacterAggregateEntity from '../data/entities/aggregate/global/global.character.aggregate.entity';
import GlobalClassAggregateEntity from '../data/entities/aggregate/global/global.class.aggregate.entity';
import GlobalFacilityControlAggregateEntity from '../data/entities/aggregate/global/global.facility.control.aggregate.entity';
import GlobalFactionCombatAggregateEntity from '../data/entities/aggregate/global/global.faction.combat.aggregate.entity';
import GlobalOutfitAggregateEntity from '../data/entities/aggregate/global/global.outfit.aggregate.entity';
import GlobalWeaponAggregateEntity from '../data/entities/aggregate/global/global.weapon.aggregate.entity';
import InstanceCharacterAggregateEntity from '../data/entities/aggregate/instance/instance.character.aggregate.entity';
import InstanceClassAggregateEntity from '../data/entities/aggregate/instance/instance.class.aggregate.entity';
import InstanceFacilityControlAggregateEntity from '../data/entities/aggregate/instance/instance.facility.control.aggregate.entity';
import InstanceFactionCombatAggregateEntity from '../data/entities/aggregate/instance/instance.faction.combat.aggregate.entity';
import InstanceOutfitAggregateEntity from '../data/entities/aggregate/instance/instance.outfit.aggregate.entity';
import InstancePopulationAggregateEntity from '../data/entities/aggregate/instance/instance.population.aggregate.entity';
import InstanceWeaponAggregateEntity from '../data/entities/aggregate/instance/instance.weapon.aggregate.entity';
import InstanceMetagameEntity from '../data/entities/instance/instance.metagame.entity';
import RestGlobalClassAggregateController from './controllers/aggregates/global/rest.aggregate.global.class.controller';
import RestGlobalCharacterAggregateController from './controllers/aggregates/global/rest.aggregate.global.character.controller';
import RestGlobalFactionCombatAggregateController from './controllers/aggregates/global/rest.aggregate.global.faction.combat.controller';
import RestGlobalOutfitAggregateController from './controllers/aggregates/global/rest.aggregate.global.outfit.controller';
import RestGlobalWeaponAggregateController from './controllers/aggregates/global/rest.aggregate.global.weapon.controller';
import RestGlobalFacilityControlAggregateController from './controllers/aggregates/global/rest.aggregate.global.facility.control.controller';
import RestInstanceCharacterAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.character.controller';
import RestInstanceClassAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.class.controller';
import RestInstanceFacilityControlAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.facility.control.controller';
import RestInstanceFactionCombatAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.faction.combat.controller';
import RestInstanceOutfitAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.outfit.controller';
import RestInstanceWeaponAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.weapon.controller';
import RestInstancePopulationAggregateController from './controllers/aggregates/instance/rest.aggregate.instance.population.controller';

/**
 * Handles incoming requests to the API via HTTP, CRUD environment.
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([
            InstanceMetagameEntity,
            GlobalCharacterAggregateEntity,
            GlobalClassAggregateEntity,
            GlobalFacilityControlAggregateEntity,
            GlobalFactionCombatAggregateEntity,
            GlobalOutfitAggregateEntity,
            GlobalWeaponAggregateEntity,
            InstanceCharacterAggregateEntity,
            InstanceClassAggregateEntity,
            InstanceFacilityControlAggregateEntity,
            InstanceFactionCombatAggregateEntity,
            InstanceOutfitAggregateEntity,
            InstancePopulationAggregateEntity,
            InstanceWeaponAggregateEntity,
        ]),
    ],
    controllers: [
        RestInstanceController,
        RestGlobalCharacterAggregateController,
        RestGlobalClassAggregateController,
        RestGlobalFacilityControlAggregateController,
        RestGlobalFactionCombatAggregateController,
        RestGlobalOutfitAggregateController,
        RestGlobalWeaponAggregateController,
        RestInstanceCharacterAggregateController,
        RestInstanceClassAggregateController,
        RestInstanceFacilityControlAggregateController,
        RestInstanceFactionCombatAggregateController,
        RestInstanceOutfitAggregateController,
        RestInstancePopulationAggregateController,
        RestInstanceWeaponAggregateController,
    ],
    providers: [{
        provide: APP_INTERCEPTOR,
        useClass: ClassSerializerInterceptor,
    }],
})
export class RestModule {}
