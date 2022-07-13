import {Inject, Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import {Ps2alertsEventState} from '../data/ps2alerts-constants/ps2alertsEventState';
import InstanceMetagameTerritoryEntity from '../data/entities/instance/instance.metagame.territory.entity';
import InstanceFactionCombatAggregateEntity
    from '../data/entities/aggregate/instance/instance.faction.combat.aggregate.entity';
import InstanceCombatHistoryAggregateEntity
    from '../data/entities/aggregate/instance/instance.combat.history.aggregate.entity';
import {RedisCacheService} from '../../services/cache/redis.cache.service';
import CombatStats from '../data/entities/aggregate/common/combat.stats.embed';
import FactionVersusFactionEmbed from '../data/entities/aggregate/common/faction.versus.faction.embed';

@Injectable()
export class CombatHistoryCron {
    private readonly logger = new Logger(CombatHistoryCron.name);
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron(): Promise<void> {
        this.logger.log('Running Combat History job');

        const documents = [];

        // Grab the current actives
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const actives: InstanceMetagameTerritoryEntity[] = await this.mongoOperationsService.findMany(InstanceMetagameTerritoryEntity, {state: Ps2alertsEventState.STARTED});

        for await (const row of actives) {
            // If instance is overdue, don't process
            if (Date.now() > (row.timeStarted.getTime() + row.duration)) {
                this.logger.warn(`Instance [${row.instanceId}] is overdue, skipping combat history job`);
                continue;
            }

            // Pull latest faction combat entity
            try {
                const factionCombat: InstanceFactionCombatAggregateEntity = await this.mongoOperationsService.findOne(
                    InstanceFactionCombatAggregateEntity,
                    {instance: row.instanceId},
                );

                const factionCombatNoId: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    _id?: unknown;
                    instance: string;
                    vs: CombatStats;
                    nc: CombatStats;
                    tr: CombatStats;
                    nso: CombatStats;
                    totals: CombatStats;
                    factionKills: FactionVersusFactionEmbed;
                } = {
                    ...factionCombat,
                };

                delete factionCombatNoId._id;

                documents.push(Object.assign(
                    factionCombatNoId,
                    {
                        timestamp: new Date(),
                    },
                ));

                this.logger.log(`Updated combat history for instance ${row.instanceId}`);
            } catch (e) {
                // Ignore error if there isn't any
            }
        }

        if (documents.length > 0) {
            await this.mongoOperationsService.insertMany(
                InstanceCombatHistoryAggregateEntity,
                documents,
            );
        }

        // @See CronHealthIndicator
        // This sets the fact that the cron has run, so if it hasn't been run it will be terminated.
        const key = '/crons/combatHistory';
        await this.cacheService.set(key, Date.now(), 65); // 65 seconds = deadline for this cron
        this.logger.debug('Set combat cron run time');
    }
}
