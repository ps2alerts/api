// import {Inject, Injectable, Logger} from '@nestjs/common';
// import {Cron, CronExpression} from '@nestjs/schedule';
// import MongoOperationsService from '../../services/mongo/mongo.operations.service';
// import {Ps2alertsEventState} from '../data/ps2alerts-constants/ps2alertsEventState';
// import InstanceMetagameTerritoryEntity from '../data/entities/instance/instance.metagame.territory.entity';
// import InstanceFactionCombatAggregateEntity
//     from '../data/entities/aggregate/instance/instance.faction.combat.aggregate.entity';
// import InstanceCombatHistoryAggregateEntity
//     from '../data/entities/aggregate/instance/instance.combat.history.aggregate.entity';
// import {RedisCacheService} from '../../services/cache/redis.cache.service';
// import {World} from "../data/ps2alerts-constants/world";
// import {Zone} from "../data/ps2alerts-constants/zone";
// import {Faction} from "../data/ps2alerts-constants/faction";
// import {Cache} from "cache-manager";
//
// @Injectable()
// export class PopulationHistoryCron {
//     private readonly logger = new Logger(PopulationHistoryCron.name);
//
//     private cacheClient: Cache;
//
//     constructor(
//         @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
//         private readonly cacheService: RedisCacheService,
//     ) {
//         this.cacheClient = cacheService.getClient();
//     }
//
//     @Cron(CronExpression.EVERY_MINUTE)
//     async handleCron(): Promise<void> {
//         this.logger.log('Running population history job');
//
//         // Grab the current actives
//         // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//         const actives: InstanceMetagameTerritoryEntity[] = await this.mongoOperationsService.findMany(InstanceMetagameTerritoryEntity, {state: Ps2alertsEventState.STARTED});
//
//         const documents: Array<{ instance: string, timestamp: Date, vs: number, nc: number, tr: number, nso: number, total: number }> = [];
//
//         for await (const instance of actives) {
//             // If instance is overdue, don't process
//             if (Date.now() > (instance.timeStarted.getTime() + instance.duration)) {
//                 this.logger.warn(`Instance [${instance.instanceId}] is overdue, skipping population history job`);
//                 continue;
//             }
//
//             // Scan through each world, each zone and each faction to get the count from the set.
//             let total = 0;
//
//             for (const faction of factionArray) {
//                 const worldZoneKey = `${instance.world}-${instance.zone}-${faction}`;
//                 const chars = await this.getCharacterList(world, zone, faction);
//
//                 // If there are no characters, don't bother.
//                 if (chars.length === 0) {
//                     continue;
//                 }
//
//                 total += chars.length;
//
//                 // If this is the first run for the world / zone, make a empty PopulationData entry.
//                 if (!populationData.has(mapKey)) {
//                     populationData.set(mapKey, new PopulationData(
//                         world,
//                         zone,
//                         0,
//                         0,
//                         0,
//                         0,
//                         0,
//                     ));
//                 }
//
//                 const map = populationData.get(mapKey);
//
//                 if (map) {
//                     const factionShortKey = FactionUtils.parseFactionIdToShortName(faction);
//                     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//                     // @ts-ignore
//                     map[factionShortKey] = chars.length;
//                     populationData.set(mapKey, map);
//                 }
//             }
//
//             // Update totals
//             const map = populationData.get(mapKey);
//
//             if (map) {
//                 map.total = total;
//                 populationData.set(mapKey, map);
//             }
//
//             // Pull latest populations from redis
//             try {
//                 const
//
//                 // Check if instances match data
//                 documents.push({
//                     instance: instance.instanceId,
//                     timestamp: new Date(),
//                     vs: event.vs,
//                     nc: event.nc,
//                     tr: event.tr,
//                     nso: event.nso,
//                     total: event.total,
//                 });
//                 this.logger.log(`Updated population history for instance ${instance.instanceId}`);
//             } catch (e) {
//                 // Ignore error if there isn't any
//             }
//         }
//
//         if (documents.length > 0) {
//             await this.mongoOperationsService.insertMany(
//                 InstanceCombatHistoryAggregateEntity,
//                 documents,
//             );
//         }
//
//         // @See CronHealthIndicator
//         // This sets the fact that the cron has run, so if it hasn't been run it will be terminated.
//         const key = '/crons/combatHistory';
//         await this.cacheService.set(key, Date.now(), 65); // 65 seconds = deadline for this cron
//         this.logger.debug('Set combat cron run time');
//     }
//
//     private getCharacters(world: World, zone: Zone, faction: Faction) {
//         const chars = await this.cacheClient.smembers(`CharacterPresencePops-${world}-${zone}-${faction}`);
//
//         // For each character, loop through and check if they still exist in Redis, which is based off an expiry.
//         // If they don't, they're inactive, so we'll delete them out of the set.
//         // eslint-disable-next-line @typescript-eslint/no-for-in-array
//         for (const char in chars) {
//             const exists = await this.cacheClient.exists(`CharacterPresence-${chars[char]}`);
//
//             if (!exists) {
//                 CharacterPresenceHandler.logger.silly(`Removing stale char ${chars[char]} from set CharacterPresencePops-${world}-${zone}-${faction}`);
//                 await this.cacheClient.srem(`CharacterPresencePops-${world}-${zone}-${faction}`, chars[char]);
//                 changes = true;
//             }
//         }
//
//         // Since the above list has been changed, we'll return the characters again.
//         if (changes) {
//             return await this.cacheClient.smembers(`CharacterPresencePops-${world}-${zone}-${faction}`);
//         }
//     }
// }
