/* eslint-disable @typescript-eslint/naming-convention */
import {Inject, Injectable, Logger} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import {Ps2alertsEventState} from '../data/constants/eventstate.consts';
import InstanceMetagameTerritoryEntity from '../data/entities/instance/instance.metagame.territory.entity';
import {RedisCacheService} from '../../services/cache/redis.cache.service';
import InstanceCharacterAggregateEntity from '../data/entities/aggregate/instance/instance.character.aggregate.entity';

@Injectable()
export class KpmCron {
    private readonly logger = new Logger(KpmCron.name);
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    @Cron('*/15 * * * * *') // Every 15 seconds
    async handleCron(): Promise<void> {
        this.logger.log('Running KPM cron job');
        const now = new Date();

        // Grab the current actives
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const actives: InstanceMetagameTerritoryEntity[] = await this.mongoOperationsService.findMany(InstanceMetagameTerritoryEntity, {state: Ps2alertsEventState.STARTED, 'features.kpm': true});

        for await (const instance of actives) {
            if (Date.now() > (instance.timeStarted.getTime() + instance.duration)) {
                this.logger.warn(`Instance [${instance.instanceId}] is overdue, skipping KPM job`);
                continue;
            }

            this.logger.verbose(`Updating KPMs for instance ${instance.instanceId}`);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const characters: InstanceCharacterAggregateEntity[] = await this.mongoOperationsService.findMany(InstanceCharacterAggregateEntity, {instance: instance.instanceId});
            const currentDuration = this.currentDuration(instance, now);

            // Calculate metrics
            for (const character of characters) {
                const docs = [];

                // Calculate character's current duration in the alert
                const durationInAlert = parseInt((currentDuration - character.durationFirstSeen).toFixed(0), 10); // Duration in seconds

                docs.push({$set: {durationInAlert}});
                const durationInMinutes = durationInAlert / 60;

                // Calculate metrics
                const xPerMinutes = {
                    killsPerMinute: character.kills && character.kills > 0 ? parseFloat((character.kills / durationInMinutes).toFixed(2)) : 0,
                    deathsPerMinute: character.deaths && character.deaths > 0 ? parseFloat((character.deaths / durationInMinutes).toFixed(2)) : 0,
                    teamKillsPerMinute: character.teamKills && character.teamKills > 0 ? parseFloat((character.teamKills / durationInMinutes).toFixed(2)) : 0,
                    suicidesPerMinute: character.suicides && character.suicides > 0 ? parseFloat((character.suicides / durationInMinutes).toFixed(2)) : 0,
                };

                docs.push({$set: {xPerMinutes}});

                try {
                    await this.mongoOperationsService.upsert(
                        InstanceCharacterAggregateEntity,
                        docs,
                        [{
                            instance: instance.instanceId,
                            'character.id': character.character.id,
                        }]);
                } catch (err) {
                    if (err instanceof Error) {
                        this.logger.error(`[${instance.instanceId}] Unable to update InstanceCharacterAggregates for Character ${character.character.name}. E: ${err.message}`);
                    }
                }
            }

        }

        // @See CronHealthIndicator
        // This sets the fact that the cron has run, so if it hasn't been run it will be terminated.
        const key = '/crons/kpm';
        await this.cacheService.set(key, Date.now(), 65); // 65 seconds = deadline for this cron
        this.logger.debug('Set kpm cron run time');
    }

    public currentDuration(instance: InstanceMetagameTerritoryEntity, now: Date): number {
        // Return current difference in seconds between start and now
        const nowUnix = now.getTime() / 1000;
        const timeStartUnix = instance.timeStarted.getTime() / 1000;
        // Holy mother of brackets batman!
        return parseInt((nowUnix - timeStartUnix).toFixed(0), 10);
    }
}
