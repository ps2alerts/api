import {HttpService, Inject, Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import {RedisCacheService} from '../../services/cache/redis.cache.service';
import { lithafalconCensusUrl, lithafalconEndpoints } from '../data/ps2alerts-constants/lithafalconEndpoints';
import LithaFalconOutfitWarDataInterface from '../data/ps2alerts-constants/interfaces/LithaFalconOutfitWarDataInterface';
import GlobalOutfitAggregateEntity from '../data/entities/aggregate/global/global.outfit.aggregate.entity';
import OutfitwarsRankingEntity from '../data/entities/instance/outfitwars.ranking.entity';
import { World } from '../data/ps2alerts-constants/world';
import { getOutfitWarRound } from '../data/ps2alerts-constants/outfitwars/utils';
import OutfitEmbed from '../data/entities/aggregate/common/outfit.embed';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class OutfitWarsRankingsCron {
    private readonly logger = new Logger(OutfitWarsRankingsCron.name);
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly httpService: HttpService,
        private readonly cacheService: RedisCacheService,
        private readonly config: ConfigService
    ) {}

    @Cron("0 8 * 8,9,10 0")
    async handleCron(): Promise<void> {
        this.logger.log('Running Outfit Wars Matches job');

        const documents = [];
        const conditionals = [];

        const outfitRankings: LithaFalconOutfitWarDataInterface[] = (await this.httpService.get(lithafalconCensusUrl + lithafalconEndpoints.outfitWarMatches).toPromise()).data.outfit_war_list;
        const timestamp = new Date();

        for (const outfitRanking of outfitRankings) {
            if(outfitRanking.world_id === World.SOLTECH) {
                // We cannot support Soltech due to API issues
                continue;
            }
            const outfitWarRanking = outfitRanking.outfit_war_id_join_outfit_war_rounds.primary_round_id_join_outfit_war_ranking;
            const outfit: OutfitEmbed | null = await this.mongoOperationsService.findOne<GlobalOutfitAggregateEntity>(
                GlobalOutfitAggregateEntity, {
                    'outfit.id': outfitWarRanking.outfit_id
                }
            ).then((entity: GlobalOutfitAggregateEntity) => {
                return entity.outfit;
            }).catch(() => {
                this.logger.error('Failed to find outfit with our own data! Falling back to census!');
                return this.httpService.get(`https://census.daybreakgames.com/s:${this.config.get<string>('census.serviceId')}/get/ps2:v2/outfit?outfit_id=${outfitWarRanking.outfit_id}&c:show=alias,name,leader_character_id,outfit_id&c:join=type:character^on:leader_character_id^to:character_id^show:faction_id^inject_at:leader&c:limit=1`).toPromise().then((res) => {
                    if(res.data.error) {
                        throw new Error(res.data.error);
                    }
                    const outfitInfo = res.data.outfit_list[0];
                    return {
                        id: outfitInfo.outfit_id,
                        name: outfitInfo.name,
                        faction: parseInt(outfitInfo.leader.faction_id, 10),
                        world: outfitRanking.world_id,
                        leader: outfitInfo.leader_character_id,
                        tag: outfitInfo.alias
                    };
                }).catch((err: Error) => {
                    this.logger.error(`Census failed to return outfit '${outfitWarRanking.outfit_id}' with error '${err.message}'! Skipping it!`);
                    return null;
                });
            });
            if (outfit === null) {
                continue;
            }
            documents.push({'$set': {
                timestamp,
                round: getOutfitWarRound(timestamp),
                world: outfitRanking.world_id,
                outfitWarId: outfitRanking.outfit_war_id,
                roundId: outfitWarRanking.round_id,
                outfit: outfit,
                rankingParameters: outfitWarRanking.ranking_parameters,
                order: outfitWarRanking.order
            }});

            conditionals.push({
                round: getOutfitWarRound(timestamp),
                'outfit.id': outfit.id
            });
        }

        if (documents.length > 0) {
            await this.mongoOperationsService.upsertMany(
                OutfitwarsRankingEntity,
                documents,
                conditionals
            ).catch((err: Error) => {
                this.logger.error(`${err.name} during upsertMany: ${err.message}`)
            });
        }

        // @See CronHealthIndicator
        // This sets the fact that the cron has run, so if it hasn't been run it will be terminated.
        const key = '/crons/outfitwarsrankings';
        await this.cacheService.set(key, Date.now(), 65); // 65 seconds = deadline for this cron
        this.logger.debug('Set outfit wars ranking cron run time');
    }
}
