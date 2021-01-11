import {Inject, Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import {Ps2alertsEventState} from '../data/constants/eventstate.consts';
import InstanceMetagameTerritoryEntity from '../data/entities/instance/instance.metagame.territory.entity';
import InstanceFactionCombatAggregateEntity
    from '../data/entities/aggregate/instance/instance.faction.combat.aggregate.entity';
import InstanceCombatHistoryAggregateEntity
    from '../data/entities/aggregate/instance/instance.combat.history.aggregate.entity';

@Injectable()
export class CombatHistoryCron {
    private readonly logger = new Logger(CombatHistoryCron.name);
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron(): Promise<void> {
        // this.logger.debug('Running Combat History job');

        const documents = [];

        // Grab the current actives
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const actives: InstanceMetagameTerritoryEntity[] = await this.mongoOperationsService.findMany(InstanceMetagameTerritoryEntity, {state: Ps2alertsEventState.STARTED});

        for await (const row of actives) {
            // If instance is overdue, don't process
            if (Date.now() > (row.timeStarted.getTime() + row.duration)) {
                this.logger.error(`Instance [${row.instanceId}] is overdue, skipping combat history job`);
                continue;
            }

            // Pull latest faction combat entity
            try {
                const factionCombat: InstanceFactionCombatAggregateEntity = await this.mongoOperationsService.findOne(
                    InstanceFactionCombatAggregateEntity,
                    {instance: row.instanceId},
                );
                delete factionCombat._id;

                documents.push(Object.assign(
                    factionCombat,
                    {
                        timestamp: new Date(),
                    },
                ));
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
    }
}
