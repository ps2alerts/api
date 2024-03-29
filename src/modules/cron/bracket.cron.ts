/* eslint-disable @typescript-eslint/naming-convention */
import {Inject, Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import {Ps2AlertsEventState} from '../data/ps2alerts-constants/ps2AlertsEventState';
import InstanceMetagameTerritoryEntity from '../data/entities/instance/instance.metagame.territory.entity';
import InstancePopulationAggregateEntity
    from '../data/entities/aggregate/instance/instance.population.aggregate.entity';
import {Bracket} from '../data/ps2alerts-constants/bracket';
import InstancePopulationAveragesAggregateEntity from '../data/entities/aggregate/instance/instance.population.averages.aggregate.entity';
import {World} from '../data/ps2alerts-constants/world';
import {RedisCacheService} from '../../services/cache/redis.cache.service';

interface PipelineResult {
    _id: string;
    vs: number;
    nc: number;
    tr: number;
    nso: number;
}

@Injectable()
export class BracketCron {
    private readonly logger = new Logger(BracketCron.name);
    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron(): Promise<void> {
        this.logger.log('Running Alert Bracket job');

        const primeMin = 192; // 4+ platoons
        const highMin = 144; // 3-4 platoons
        const medMin = 96; // 2-3 platoons
        const lowMin = 48; // 1-2 platoons

        // Grab the current actives
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const actives: InstanceMetagameTerritoryEntity[] = await this.mongoOperationsService.findMany(InstanceMetagameTerritoryEntity, {state: Ps2AlertsEventState.STARTED});

        for await (const instance of actives) {
            // If Jaeger, skip and keep as 0 (N/A)
            if (instance.world === World.JAEGER) {
                this.logger.debug('Jaeger instance detected, skipping bracket calculation');
                continue;
            }

            const now = new Date().getTime();
            const startCountingFrom = instance.timeStarted.getTime() + (60 * 5 * 1000);
            const startDate = new Date(startCountingFrom);

            if (now < startCountingFrom) {
                this.logger.debug(`Skipping bracket calculations for instance ${instance.instanceId}, pops still warming up`);
                continue;
            }

            // Pull latest faction combat entity
            try {
                const averages: PipelineResult[] = await this.mongoOperationsService.aggregate(
                    InstancePopulationAggregateEntity,
                    [{
                        $match: {
                            instance: instance.instanceId,
                            timestamp: {$gt: startDate},
                            total: {$gt: 5}, // To not count instances when aggregator has reset it's pops due to restarts
                        },
                    }, {
                        $group: {
                            _id: '$instance',
                            vs: {
                                $avg: '$vs',
                            },
                            nc: {
                                $avg: '$nc',
                            },
                            tr: {
                                $avg: '$tr',
                            },
                            nso: {
                                $avg: '$nso',
                            },
                        },
                    }],
                );

                for await (const result of averages) {
                    let bracket = Bracket.UNKNOWN;

                    // Evaluate for Prime
                    if (
                        result.vs >= primeMin &&
                        result.nc >= primeMin &&
                        result.tr >= primeMin
                    ) {
                        bracket = Bracket.PRIME;
                    } else if (
                        result.vs >= highMin &&
                        result.nc >= highMin &&
                        result.tr >= highMin
                    ) {
                        bracket = Bracket.HIGH;
                    } else if (
                        result.vs >= medMin &&
                        result.nc >= medMin &&
                        result.tr >= medMin
                    ) {
                        bracket = Bracket.MEDIUM;
                    } else if (
                        result.vs >= lowMin &&
                        result.nc >= lowMin &&
                        result.tr >= lowMin
                    ) {
                        bracket = Bracket.LOW;
                    } else {
                        bracket = Bracket.DEAD;
                    }

                    try {
                        await this.mongoOperationsService.upsert(
                            InstanceMetagameTerritoryEntity,
                            [{$set: {bracket}}],
                            [{instanceId: result._id}],
                        );

                        const total = result.vs + result.nc + result.tr + result.nso;
                        await this.mongoOperationsService.insertOne(
                            InstancePopulationAveragesAggregateEntity,
                            {
                                instance: result._id,
                                timestamp: new Date(),
                                vs: parseInt(String(result.vs), 10),
                                nc: parseInt(String(result.nc), 10),
                                tr: parseInt(String(result.tr), 10),
                                nso: parseInt(String(result.nso), 10),
                                total: parseInt(String(total), 10),
                            },
                        );
                        this.logger.log(`Updated brackets for instance ${result._id}`);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } catch (err: any) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
                        this.logger.error(`Unable to update bracket for instance ${result._id} - E: ${err.message}`);
                    }
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                // Ignore error if there isn't any
            }
        }

        // @See CronHealthIndicator
        // This sets the fact that the cron has run, so if it hasn't been run it will be terminated.
        const key = '/crons/brackets';
        await this.cacheService.set(key, Date.now(), 65); // 65 seconds = deadline for this cron
        this.logger.debug('Set bracket cron run time');
    }
}
