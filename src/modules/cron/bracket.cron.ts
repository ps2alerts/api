/* eslint-disable @typescript-eslint/naming-convention */
import {Inject, Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import MongoOperationsService from '../../services/mongo/mongo.operations.service';
import {Ps2alertsEventState} from '../data/constants/eventstate.consts';
import InstanceMetagameTerritoryEntity from '../data/entities/instance/instance.metagame.territory.entity';
import InstancePopulationAggregateEntity
    from '../data/entities/aggregate/instance/instance.population.aggregate.entity';
import {Bracket} from '../data/constants/bracket.consts';
import InstancePopulationAveragesAggregateEntity from '../data/entities/aggregate/instance/instance.population.averages.aggregate.entity';

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
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron(): Promise<void> {
        this.logger.debug('Running Alert Bracket job');

        const primeMin = 240;
        const highMin = 144;
        const medMin = 96;
        const lowMin = 48;

        // Grab the current actives
        const actives: InstanceMetagameTerritoryEntity[] = await this.mongoOperationsService.findMany(InstanceMetagameTerritoryEntity, {state: Ps2alertsEventState.STARTED});

        for await (const row of actives) {
            // Pull latest faction combat entity
            try {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                const averages: PipelineResult[] = await this.mongoOperationsService.aggregate(
                    InstancePopulationAggregateEntity,
                    [{
                        $match: {
                            instance: row.instanceId,
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
                    } catch (e) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/restrict-template-expressions
                        this.logger.error(`Unable to update bracket for instance ${result._id} - E: ${e.message}`);
                    }

                    this.logger.debug(`Updated bracket for ${result._id} = ${bracket}`);

                }

            } catch (e) {
                // Ignore error if there isn't any
            }
        }

        // if (documents.length > 0) {
        //     await this.mongoOperationsService.insertMany(
        //         InstanceCombatHistoryAggregateEntity,
        //         documents,
        //     );
        // }
    }
}
