/* eslint-disable @typescript-eslint/naming-convention */
import {Inject, Injectable, Logger} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import {Ps2alertsEventState} from '../data/ps2alerts-constants/ps2alertsEventState';
import InstanceMetagameTerritoryEntity from '../data/entities/instance/instance.metagame.territory.entity';
import {RedisCacheService} from '../../services/cache/redis.cache.service';
import InstanceCharacterAggregateEntity from '../data/entities/aggregate/instance/instance.character.aggregate.entity';
import InstanceOutfitAggregateEntity from '../data/entities/aggregate/instance/instance.outfit.aggregate.entity';

@Injectable()
export class XpmCron {
    private readonly logger = new Logger(XpmCron.name);
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    @Cron('*/15 * * * * *') // Every 15 seconds
    async handleCron(): Promise<void> {
        this.logger.log('Running XPM cron job');
        const now = new Date();

        // Grab the current actives
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const actives: InstanceMetagameTerritoryEntity[] = await this.mongoOperationsService.findMany(InstanceMetagameTerritoryEntity, {state: Ps2alertsEventState.STARTED, 'features.xpm': true});

        for await (const instance of actives) {
            if (Date.now() > (instance.timeStarted.getTime() + instance.duration)) {
                this.logger.warn(`Instance [${instance.instanceId}] is overdue, skipping XPM job`);
                continue;
            }

            await this.characterMetrics(instance, now);
            await this.outfitMetrics(instance, now);
        }

        // @See CronHealthIndicator
        // This sets the fact that the cron has run, so if it hasn't been run it will be terminated.
        const key = '/crons/xpm';
        await this.cacheService.set(key, Date.now(), 65); // 65 seconds = deadline for this cron
        this.logger.debug('Set xpm cron run time');
    }

    async characterMetrics(instance: InstanceMetagameTerritoryEntity, now: Date): Promise<void> {
        this.logger.debug(`Updating Character XPMs for instance ${instance.instanceId}`);
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
                headshotsPerMinute: character.headshots && character.headshots > 0 ? parseFloat((character.headshots / durationInMinutes).toFixed(2)) : 0,
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

    async outfitMetrics(instance: InstanceMetagameTerritoryEntity, now: Date): Promise<void> {
        this.logger.debug(`Updating Outfit XPMs for instance ${instance.instanceId}`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const outfits: InstanceOutfitAggregateEntity[] = await this.mongoOperationsService.findMany(InstanceOutfitAggregateEntity, {instance: instance.instanceId});
        const currentDuration = this.currentDuration(instance, now);

        // Calculate metrics
        for (const outfit of outfits) {
            const docs = [];

            // Calculate character's current duration in the alert
            const durationInAlert = parseInt((currentDuration - outfit.durationFirstSeen).toFixed(0), 10); // Duration in seconds

            docs.push({$set: {durationInAlert}});
            const durationInMinutes = durationInAlert / 60;

            // Calculate metrics
            const xPerMinutes = {
                killsPerMinute: outfit.kills && outfit.kills > 0 ? parseFloat((outfit.kills / durationInMinutes).toFixed(2)) : 0,
                deathsPerMinute: outfit.deaths && outfit.deaths > 0 ? parseFloat((outfit.deaths / durationInMinutes).toFixed(2)) : 0,
                teamKillsPerMinute: outfit.teamKills && outfit.teamKills > 0 ? parseFloat((outfit.teamKills / durationInMinutes).toFixed(2)) : 0,
                suicidesPerMinute: outfit.suicides && outfit.suicides > 0 ? parseFloat((outfit.suicides / durationInMinutes).toFixed(2)) : 0,
                headshotsPerMinute: outfit.headshots && outfit.headshots > 0 ? parseFloat((outfit.headshots / durationInMinutes).toFixed(2)) : 0,
            };

            const xPerMinutesOutfit = {
                killsPerMinutePerParticipant: outfit.kills > 0 ? parseFloat((xPerMinutes.killsPerMinute / outfit.participants).toFixed(3)) : 0,
                deathsPerMinutePerParticipant: outfit.kills > 0 ? parseFloat((xPerMinutes.deathsPerMinute / outfit.participants).toFixed(3)) : 0,
                teamKillsPerMinutePerParticipant: outfit.kills > 0 ? parseFloat((xPerMinutes.teamKillsPerMinute / outfit.participants).toFixed(3)) : 0,
                suicidesPerMinutePerParticipant: outfit.kills > 0 ? parseFloat((xPerMinutes.suicidesPerMinute / outfit.participants).toFixed(3)) : 0,
                headshotsPerMinutePerParticipant: outfit.kills > 0 ? parseFloat((xPerMinutes.headshotsPerMinute / outfit.participants).toFixed(3)) : 0,
            };

            docs.push({$set: {xPerMinutes: {...xPerMinutes, ...xPerMinutesOutfit}}});

            try {
                await this.mongoOperationsService.upsert(
                    InstanceOutfitAggregateEntity,
                    docs,
                    [{
                        instance: instance.instanceId,
                        'outfit.id': outfit.outfit.id,
                    }]);
            } catch (err) {
                if (err instanceof Error && outfit.outfit) {
                    this.logger.error(`[${instance.instanceId}] Unable to update InstanceOutfitAggregates for Outfit ${outfit.outfit.name}. E: ${err.message}`);
                }
            }
        }
    }

    public currentDuration(instance: InstanceMetagameTerritoryEntity, now: Date): number {
        // Return current difference in seconds between start and now
        const nowUnix = now.getTime() / 1000;
        const timeStartUnix = instance.timeStarted.getTime() / 1000;
        // Holy mother of brackets batman!
        return parseInt((nowUnix - timeStartUnix).toFixed(0), 10);
    }
}
