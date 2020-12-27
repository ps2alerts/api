import {Module} from '@nestjs/common';
import {CombatHistoryCron} from './combat.history.cron';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import InstanceMetagameTerritoryEntity from '../data/entities/instance/instance.metagame.territory.entity';
import InstanceFactionCombatAggregateEntity
    from '../data/entities/aggregate/instance/instance.faction.combat.aggregate.entity';
import InstanceCombatHistoryAggregateEntity
    from '../data/entities/aggregate/instance/instance.combat.history.aggregate.entity';
import {BracketCron} from './bracket.cron';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            InstanceCombatHistoryAggregateEntity,
            InstanceFactionCombatAggregateEntity,
            InstanceMetagameTerritoryEntity,
        ]),
    ],
    providers: [
        MongoOperationsService,
        CombatHistoryCron,
        BracketCron,
    ],
})
export class CronModule {}
