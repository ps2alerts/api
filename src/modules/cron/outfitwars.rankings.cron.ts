/* eslint-disable @typescript-eslint/naming-convention */
import {HttpService, Inject, Injectable, Logger} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import {RedisCacheService} from '../../services/cache/redis.cache.service';
import {lithafalconCensusUrl, lithafalconEndpoints} from '../data/ps2alerts-constants/lithafalconEndpoints';
import LithaFalconOutfitWarDataInterface from '../data/ps2alerts-constants/interfaces/LithaFalconOutfitWarDataInterface';
import GlobalOutfitAggregateEntity from '../data/entities/aggregate/global/global.outfit.aggregate.entity';
import OutfitwarsRankingEntity from '../data/entities/instance/outfitwars.ranking.entity';
import {World} from '../data/ps2alerts-constants/world';
import OutfitEmbed from '../data/entities/aggregate/common/outfit.embed';
import {ConfigService} from '@nestjs/config';
import getCensusBaseUrl from '../data/ps2alerts-constants/utils/census';
import {CensusEnvironment} from '../data/ps2alerts-constants/censusEnvironments';
import {
    OutfitLeaderCharacterFactionJoinInterface,
} from '../data/ps2alerts-constants/interfaces/census-responses/OutfitLeaderCharacterFactionJoinInterface';

@Injectable()
export class OutfitWarsRankingsCron {
    private readonly logger = new Logger(OutfitWarsRankingsCron.name);
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly httpService: HttpService,
        private readonly cacheService: RedisCacheService,
        private readonly config: ConfigService,
    ) {}

    // @Cron('0 8 * 8,9,10 0') // 8AM UTC on every Sunday in August - October
    @Cron('*/5 * * * *') // Swap to this to get the data now
    async handleCron(): Promise<void> {
        this.logger.log('Running Outfit Wars Matches job');

        const serviceId: string | undefined = this.config.get('census.serviceId');

        if (!serviceId) {
            throw new Error('Service ID is empty!');
        }

        const documents = [];
        const conditionals = [];

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
        const outfitRankings: LithaFalconOutfitWarDataInterface[] = (await this.httpService.get(lithafalconCensusUrl + lithafalconEndpoints.outfitWarMatches).toPromise()).data.outfit_war_list;
        const timestamp = new Date();

        for (const outfitRankingInterface of outfitRankings) {
            const outfitWarRanking = this.parseLithaFalconRanking(outfitRankingInterface);

            if (outfitWarRanking.world_id === World.SOLTECH) {
                // We cannot support SolTech due to API issues
                continue;
            }

            const outfit: OutfitEmbed | null = await this.mongoOperationsService.findOne<GlobalOutfitAggregateEntity>(
                GlobalOutfitAggregateEntity, {
                    'outfit.id': outfitWarRanking.outfit_id,
                },
            ).then((entity: GlobalOutfitAggregateEntity) => {
                return entity.outfit;
            }).catch(() => {
                this.logger.warn('Failed to find outfit with our own data! Falling back to census!');
                return this.httpService.get(`${getCensusBaseUrl(serviceId, CensusEnvironment.PC)}/outfit?outfit_id=${outfitWarRanking.outfit_id}&c:show=alias,name,leader_character_id,outfit_id&c:join=type:character^on:leader_character_id^to:character_id^show:faction_id^inject_at:leader&c:limit=1`).toPromise().then((res) => {
                    const data = res.data as OutfitLeaderCharacterFactionJoinInterface;

                    if (data.error) {
                        throw new Error(data.error);
                    }

                    const outfitInfo = data.outfit_list[0];
                    return {
                        id: outfitInfo.outfit_id,
                        name: outfitInfo.name,
                        faction: parseInt(outfitInfo.leader.faction_id, 10),
                        world: outfitWarRanking.world_id,
                        leader: outfitInfo.leader_character_id,
                        tag: outfitInfo.alias,
                    };
                }).catch((err: Error) => {
                    this.logger.error(`Census failed to return outfit '${outfitWarRanking.outfit_id}' with error '${err.message}'! Skipping it!`);
                    return null;
                });
            });

            if (outfit === null) {
                continue;
            }

            documents.push({$set: {
                timestamp,
                round: outfitWarRanking.ranking_parameters.MatchesPlayed + 1,
                world: outfitWarRanking.world_id,
                outfitWarId: outfitWarRanking.outfit_war_id,
                roundId: outfitWarRanking.round_id,
                outfit,
                rankingParameters: outfitWarRanking.ranking_parameters,
                order: outfitWarRanking.order,
                instanceId: null,
            }});

            conditionals.push({
                round: outfitWarRanking.ranking_parameters.MatchesPlayed + 1,
                'outfit.id': outfit.id,
            });
        }

        if (documents.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
            await this.mongoOperationsService.upsertMany(
                OutfitwarsRankingEntity,
                documents,
                conditionals,
            ).catch((err: Error) => {
                this.logger.error(`${err.name} during upsertMany: ${err.message}`);
            });
            this.logger.log('Outfit Wars rankings updated!');
        }

        // @See CronHealthIndicator
        // This sets the fact that the cron has run, so if it hasn't been run it will be terminated.
        const key = '/crons/outfitwarsrankings';
        await this.cacheService.set(key, Date.now(), 60 * 65); // 1 hour 5 mins
        this.logger.debug('Set outfit wars ranking cron run time');
    }

    parseLithaFalconRanking(data: LithaFalconOutfitWarDataInterface): {
        world_id: number;
        outfit_war_id: number;
        round_id: string;
        outfit_id: string;
        order: number;
        ranking_parameters: {
            TotalScore: number;
            MatchesPlayed: number;
            Wins: number;
            Losses: number;
            TiebreakerPoints: number;
            FactionRank: number;
            GlobalRank: number;
        };
    } {
        const outfitWarRankingInterface = data.outfit_war_id_join_outfit_war_rounds.primary_round_id_join_outfit_war_ranking;
        const rankingParameters = outfitWarRankingInterface.ranking_parameters;
        const outfitWarRanking = {
            world_id: parseInt(data.world_id, 10),
            outfit_war_id: parseInt(data.outfit_war_id, 10),
            round_id: outfitWarRankingInterface.round_id,
            outfit_id: outfitWarRankingInterface.outfit_id,
            order: parseInt(outfitWarRankingInterface.order, 10),
            ranking_parameters: {
                TotalScore: parseInt(rankingParameters.TotalScore, 10),
                MatchesPlayed: parseInt(rankingParameters.MatchesPlayed, 10),
                Wins: parseInt(rankingParameters.Wins, 10),
                Losses: parseInt(rankingParameters.Losses, 10),
                TiebreakerPoints: parseInt(rankingParameters.TiebreakerPoints, 10),
                FactionRank: parseInt(rankingParameters.FactionRank, 10),
                GlobalRank: parseInt(rankingParameters.GlobalRank, 10),
            },
        };
        return outfitWarRanking;
    }
}