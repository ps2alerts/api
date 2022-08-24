import {HttpService, Inject, Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import {RedisCacheService} from '../../services/cache/redis.cache.service';
import { lithafalconCensusUrl, lithafalconEndpoints } from '../data/ps2alerts-constants/lithafalconEndpoints';
import LithaFalconOutfitWarDataInterface from '../data/ps2alerts-constants/interfaces/LithaFalconOutfitWarDataInterface';
import GlobalOutfitAggregateEntity from '../data/entities/aggregate/global/global.outfit.aggregate.entity';
import OutfitwarsRankingEntity from '../data/entities/instance/outfitwars.ranking.entity';
import { WorldPC } from '../data/ps2alerts-constants/world';

@Injectable()
export class OutfitWarsRankingsCron {
    private readonly logger = new Logger(OutfitWarsRankingsCron.name);
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly httpService: HttpService,
        private readonly cacheService: RedisCacheService,
    ) {}

    @Cron("0 8 * 8,9,10 0")
    async handleCron(): Promise<void> {
        this.logger.log('Running Outfit Wars Matches job');

        const documents = [];

        const outfitRankings: LithaFalconOutfitWarDataInterface[] = (await this.httpService.get(lithafalconCensusUrl + lithafalconEndpoints.outfitWarMatches).toPromise()).data.outfit_war_list;
        const timestamp = new Date();

        for (const outfitRanking of outfitRankings) {
            if(outfitRanking.world_id === WorldPC.SOLTECH) {
                // We cannot support Soltech due to API issues
                continue;
            }
            const outfitWarRanking = outfitRanking.outfit_war_id_join_outfit_war_rounds.primary_round_id_join_outfit_war_ranking;
            const outfit: GlobalOutfitAggregateEntity | null = await this.mongoOperationsService.findOne<GlobalOutfitAggregateEntity>(
                GlobalOutfitAggregateEntity, {
                    'outfit.id': outfitWarRanking.outfit_id
                }
            ).catch((err: Error) => {
                this.logger.error(`Failed to find outfit! Error ${err.message}`);
                return null;
            });
            if (outfit === null) {
                continue;
            }
            documents.push({
                timestamp,
                world: outfitRanking.world_id,
                outfitWarId: outfitRanking.outfit_war_id,
                roundId: outfitWarRanking.round_id,
                outfit: outfit.outfit,
                rankingParameters: outfitWarRanking.ranking_parameters,
                order: outfitWarRanking.order
            })
        }

        if (documents.length > 0) {
            await this.mongoOperationsService.insertMany(
                OutfitwarsRankingEntity,
                documents,
            ).catch((err: Error) => {
                this.logger.error(`${err.name} during insertMany: ${err.message}`)
            });
        }

        // @See CronHealthIndicator
        // This sets the fact that the cron has run, so if it hasn't been run it will be terminated.
        const key = '/crons/outfitwarsrankings';
        await this.cacheService.set(key, Date.now(), 65); // 65 seconds = deadline for this cron
        this.logger.debug('Set outfit wars ranking cron run time');
    }
}
