/* eslint-disable @typescript-eslint/naming-convention,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-return */
import {Inject, Injectable, NotFoundException} from '@nestjs/common';
import MongoOperationsService from '../mongo/mongo.operations.service';
import {RedisCacheService} from '../cache/redis.cache.service';
import InstanceCharacterAggregateEntity from '../../modules/data/entities/aggregate/instance/instance.character.aggregate.entity';
import InstanceOutfitAggregateEntity from '../../modules/data/entities/aggregate/instance/instance.outfit.aggregate.entity';
import GlobalCharacterAggregateEntity from '../../modules/data/entities/aggregate/global/global.character.aggregate.entity';
import GlobalOutfitAggregateEntity from '../../modules/data/entities/aggregate/global/global.outfit.aggregate.entity';
import {Bracket} from '../../modules/data/ps2alerts-constants/bracket';
import {Ps2AlertsEventType} from '../../modules/data/ps2alerts-constants/ps2AlertsEventType';
import {Ps2AlertsEventState} from '../../modules/data/ps2alerts-constants/ps2AlertsEventState';
import {
    ProfileAlertsPage,
    ProfileBracketTotals,
    ProfileMembersPage,
    ProfileQuery,
    ProfileSummary,
    ProfileTimelineRow,
    TimelineGranularity,
} from './profile.types';

const PROFILE_BRACKETS = [Bracket.DEAD, Bracket.LOW, Bracket.MEDIUM, Bracket.HIGH, Bracket.PRIME];
const COMBAT_FIELDS = ['kills', 'deaths', 'headshots', 'teamKills', 'teamKilled', 'suicides'];

const ALERT_SORT_FIELDS: Record<string, string> = {
    instance: 'instance',
    kills: 'kills',
    deaths: 'deaths',
    headshots: 'headshots',
    teamKills: 'teamKills',
    teamKilled: 'teamKilled',
    suicides: 'suicides',
    participants: 'participants',
    timeStarted: 'details.timeStarted',
    bracket: 'details.bracket',
};

const MEMBER_SORT_FIELDS = ['kills', 'deaths', 'headshots', 'teamKills', 'suicides', 'character.name', 'character.adjustedBattleRank'];

const ALERT_PROJECTION = {
    $project: {
        _id: 0,
        instance: 1,
        kills: 1,
        deaths: 1,
        headshots: 1,
        teamKills: 1,
        teamKilled: 1,
        suicides: 1,
        participants: 1,
        battleRank: {$ifNull: ['$character.adjustedBattleRank', '$character.battleRank']},
        outfit: '$character.outfit',
        details: {
            world: '$details.world',
            zone: '$details.zone',
            bracket: '$details.bracket',
            state: '$details.state',
            timeStarted: '$details.timeStarted',
            timeEnded: '$details.timeEnded',
            victor: '$details.result.victor',
            draw: '$details.result.draw',
        },
    },
};

/**
 * Computes player and outfit profiles server-side from the per-alert aggregates, so the website receives a few
 * kilobytes of summaries and one page of history rather than every alert the subject has ever played.
 */
@Injectable()
export default class ProfileService {
    private readonly cacheTtl = 60 * 15;
    private readonly maxPageSize = 100;
    // Coalesces concurrent cold requests for the same key so an expensive pipeline runs once
    private readonly inFlight = new Map<string, Promise<unknown>>();

    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    public async summary(query: ProfileQuery): Promise<ProfileSummary> {
        return await this.cached(`summary:${this.keyOf(query)}`, async () => {
            const globals: Array<Record<string, any>> = await this.mongoOperationsService.findMany(
                this.globalEntity(query),
                {[`${query.type}.id`]: query.id, ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME, world: query.world},
            );
            const identity = globals.find((doc) => doc.bracket === Bracket.TOTAL) ?? globals[0];

            if (!identity) {
                throw new NotFoundException(`No ${query.type} found with ID ${query.id}`);
            }

            const faction = Number(identity[query.type].faction);
            const grouped: Array<Record<string, any>> = await this.mongoOperationsService.aggregate(
                this.instanceEntity(query),
                [
                    ...this.matchAndJoin(query, identity.world),
                    {
                        $group: {
                            _id: '$details.bracket',
                            ...this.sumFields(faction),
                            firstAlert: {$min: '$details.timeStarted'},
                            lastAlert: {$max: '$details.timeStarted'},
                        },
                    },
                ],
            );

            const brackets: Record<number, ProfileBracketTotals> = {};
            const totals = this.emptyTotals(Bracket.TOTAL);
            let firstAlert: Date | null = null;
            let lastAlert: Date | null = null;

            grouped.forEach((row) => {
                const bracket = Number(row._id);
                const entry = this.rowToTotals(row, bracket);

                if (PROFILE_BRACKETS.includes(bracket)) {
                    brackets[bracket] = entry;
                }

                this.addTotals(totals, entry);
                firstAlert = !firstAlert || row.firstAlert < firstAlert ? row.firstAlert : firstAlert;
                lastAlert = !lastAlert || row.lastAlert > lastAlert ? row.lastAlert : lastAlert;
            });

            // All-time views take combat totals from the global aggregates, which also cover alerts that predate per-alert tracking
            if (!query.days) {
                globals.forEach((doc) => {
                    const target = doc.bracket === Bracket.TOTAL ? totals : brackets[doc.bracket];

                    if (target) {
                        COMBAT_FIELDS.forEach((field) => {
                            (target as unknown as Record<string, number>)[field] = Number(doc[field] ?? 0);
                        });
                    }
                });
            }

            return {
                type: query.type,
                id: query.id,
                world: identity.world,
                days: query.days ?? null,
                identity,
                faction,
                totals: this.finishTotals(totals),
                brackets: Object.fromEntries(
                    Object.entries(brackets).map(([bracket, entry]) => [bracket, this.finishTotals(entry)]),
                ),
                firstAlert,
                lastAlert,
            };
        });
    }

    public async timeline(query: ProfileQuery, granularity: TimelineGranularity): Promise<ProfileTimelineRow[]> {
        return await this.cached(`timeline:${this.keyOf(query)}:${granularity}`, async () => {
            const rows: Array<Record<string, any>> = await this.mongoOperationsService.aggregate(
                this.instanceEntity(query),
                [
                    ...this.matchAndJoin(query),
                    {$match: {'details.state': Ps2AlertsEventState.ENDED}},
                    {
                        $group: {
                            _id: {
                                bucket: {$dateTrunc: {date: '$details.timeStarted', unit: granularity, startOfWeek: 'monday'}},
                                bracket: '$details.bracket',
                            },
                            ...this.sumFields(null),
                        },
                    },
                    {$sort: {'_id.bucket': 1, '_id.bracket': 1}},
                ],
            );

            return rows.map((row) => ({
                bucket: row._id.bucket,
                bracket: row._id.bracket,
                alerts: row.alerts,
                kills: row.kills,
                deaths: row.deaths,
                headshots: row.headshots,
                teamKills: row.teamKills,
                teamKilled: row.teamKilled,
                suicides: row.suicides,
                xpmAlerts: row.xpmAlerts,
                kpmTotal: row.kpmTotal,
                dpmTotal: row.dpmTotal,
            }));
        });
    }

    public async alerts(
        query: ProfileQuery,
        page: number,
        pageSize: number,
        sortBy: string,
        order: 'asc' | 'desc',
    ): Promise<ProfileAlertsPage> {
        const size = Math.min(Math.max(pageSize || 20, 1), this.maxPageSize);
        const pageNumber = Math.max(page || 1, 1);
        const sortField = ALERT_SORT_FIELDS[sortBy] ?? ALERT_SORT_FIELDS.instance;
        const direction = order === 'asc' ? 1 : -1;

        return await this.cached(`alerts:${this.keyOf(query)}:${pageNumber}:${size}:${sortField}:${direction}`, async () => {
            // Instance ids sort chronologically within a world, which keeps the default order cheap
            const sort = {$sort: {[sortField]: direction, instance: -1}};
            const pageStages = [{$skip: (pageNumber - 1) * size}, {$limit: size}];
            const needsJoinFirst = sortField.startsWith('details.') || !!query.days;

            // Joining only the page being returned is far cheaper than joining every alert first
            const pipeline = needsJoinFirst
                ? [...this.matchAndJoin(query), {$facet: {total: [{$count: 'count'}], items: [sort, ...pageStages, ALERT_PROJECTION]}}]
                : [this.matchStage(query), {$facet: {total: [{$count: 'count'}], items: [sort, ...pageStages, ...this.joinStages(), ALERT_PROJECTION]}}];

            const [result]: Array<Record<string, any>> = await this.mongoOperationsService.aggregate(this.instanceEntity(query), pipeline);

            return {
                items: result?.items ?? [],
                total: result?.total?.[0]?.count ?? 0,
                page: pageNumber,
                pageSize: size,
            };
        });
    }

    // Characters whose last known outfit is this one, from the global aggregates (membership is a current fact, not per alert)
    public async members(
        query: ProfileQuery,
        page: number,
        pageSize: number,
        sortBy: string,
        order: 'asc' | 'desc',
        search = '',
    ): Promise<ProfileMembersPage> {
        const size = Math.min(Math.max(pageSize || 20, 1), this.maxPageSize);
        const pageNumber = Math.max(page || 1, 1);
        const sortField = MEMBER_SORT_FIELDS.includes(sortBy) ? sortBy : 'kills';
        const direction = order === 'asc' ? 1 : -1;
        const term = search.trim().slice(0, 40).toLowerCase();

        return await this.cached(`members:${query.id}:W${query.world ?? 0}:${pageNumber}:${size}:${sortField}:${direction}:${term}`, async () => {
            const match: Record<string, unknown> = {
                bracket: Bracket.TOTAL,
                ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME,
                'character.outfit.id': query.id,
            };

            if (query.world) {
                match.world = query.world;
            }

            // A contains match over one outfit's members is a few thousand rows at most, so no index is needed for it
            if (term) {
                match['character.name'] = {$regex: term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i'};
            }

            const [result]: Array<Record<string, any>> = await this.mongoOperationsService.aggregate(
                GlobalCharacterAggregateEntity,
                [
                    {$match: match},
                    {
                        $facet: {
                            total: [{$count: 'count'}],
                            items: [
                                {$sort: {[sortField]: direction, 'character.id': 1}},
                                {$skip: (pageNumber - 1) * size},
                                {$limit: size},
                                {$project: {_id: 0, character: 1, kills: 1, deaths: 1, headshots: 1, teamKills: 1, suicides: 1}},
                            ],
                        },
                    },
                ],
            );

            return {
                items: result?.items ?? [],
                total: result?.total?.[0]?.count ?? 0,
                page: pageNumber,
                pageSize: size,
            };
        });
    }

    // Match the subject's per-alert rows and attach the slice of the instance record the profiles need
    private matchAndJoin(query: ProfileQuery, world?: number): Array<Record<string, unknown>> {
        const stages = [this.matchStage(query, world), ...this.joinStages()];

        if (query.days) {
            stages.push({$match: {'details.timeStarted': {$gte: new Date(Date.now() - query.days * 24 * 60 * 60 * 1000)}}});
        }

        return stages;
    }

    private matchStage(query: ProfileQuery, world?: number): Record<string, unknown> {
        const match: Record<string, unknown> = {
            [`${query.type}.id`]: query.id,
            ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME,
        };
        const worldFilter = query.world ?? world;

        if (worldFilter) {
            match[`${query.type}.world`] = worldFilter;
        }

        return {$match: match};
    }

    private joinStages(): Array<Record<string, unknown>> {
        return [
            {
                $lookup: {
                    from: 'instance_metagame_territories',
                    localField: 'instance',
                    foreignField: 'instanceId',
                    pipeline: [{$project: {_id: 0, world: 1, zone: 1, bracket: 1, state: 1, timeStarted: 1, timeEnded: 1, result: 1}}],
                    as: 'details',
                },
            },
            {$unwind: {path: '$details', preserveNullAndEmptyArrays: true}},
        ];
    }

    // Group accumulators; `faction` enables win counting, null skips it
    private sumFields(faction: number | null): Record<string, unknown> {
        const fields: Record<string, unknown> = {
            alerts: {$sum: 1},
            // Per-minute figures only exist for alerts tracked since the feature launched, and a few are stored as NaN
            xpmAlerts: {$sum: {$cond: [this.isFinite('$xPerMinutes.killsPerMinute'), 1, 0]}},
            kpmTotal: {$sum: {$cond: [this.isFinite('$xPerMinutes.killsPerMinute'), '$xPerMinutes.killsPerMinute', 0]}},
            dpmTotal: {$sum: {$cond: [this.isFinite('$xPerMinutes.deathsPerMinute'), '$xPerMinutes.deathsPerMinute', 0]}},
            // Victor 0 or null means nobody won; draws are flagged separately
            decided: {$sum: {$cond: [{$and: [{$gt: ['$details.result.victor', 0]}, {$ne: ['$details.result.draw', true]}]}, 1, 0]}},
            wins: {$sum: {$cond: [{$and: [{$ne: ['$details.result.draw', true]}, {$eq: ['$details.result.victor', faction ?? -1]}]}, 1, 0]}},
        };

        COMBAT_FIELDS.forEach((field) => {
            fields[field] = {$sum: {$ifNull: [`$${field}`, 0]}};
        });

        return fields;
    }

    // NaN compares equal to itself in Mongo, so this rejects the stored NaNs as well as missing values
    private isFinite(path: string): Record<string, unknown> {
        return {$and: [{$isNumber: path}, {$ne: [path, NaN]}]};
    }

    private rowToTotals(row: Record<string, any>, bracket: Bracket): ProfileBracketTotals {
        return {
            bracket,
            alerts: row.alerts ?? 0,
            kills: row.kills ?? 0,
            deaths: row.deaths ?? 0,
            headshots: row.headshots ?? 0,
            teamKills: row.teamKills ?? 0,
            teamKilled: row.teamKilled ?? 0,
            suicides: row.suicides ?? 0,
            xpmAlerts: row.xpmAlerts ?? 0,
            kpm: row.kpmTotal ?? 0,
            dpm: row.dpmTotal ?? 0,
            wins: row.wins ?? 0,
            decided: row.decided ?? 0,
        };
    }

    private emptyTotals(bracket: Bracket): ProfileBracketTotals {
        return {bracket, alerts: 0, kills: 0, deaths: 0, headshots: 0, teamKills: 0, teamKilled: 0, suicides: 0, xpmAlerts: 0, kpm: 0, dpm: 0, wins: 0, decided: 0};
    }

    private addTotals(target: ProfileBracketTotals, source: ProfileBracketTotals): void {
        (Object.keys(source) as Array<keyof ProfileBracketTotals>).forEach((key) => {
            if (key !== 'bracket') {
                target[key] += source[key];
            }
        });
    }

    // kpm/dpm are summed per alert until here; turn them into averages
    private finishTotals(entry: ProfileBracketTotals): ProfileBracketTotals {
        return {
            ...entry,
            kpm: entry.xpmAlerts > 0 ? entry.kpm / entry.xpmAlerts : 0,
            dpm: entry.xpmAlerts > 0 ? entry.dpm / entry.xpmAlerts : 0,
        };
    }

    private instanceEntity(query: ProfileQuery): typeof InstanceCharacterAggregateEntity | typeof InstanceOutfitAggregateEntity {
        return query.type === 'character' ? InstanceCharacterAggregateEntity : InstanceOutfitAggregateEntity;
    }

    private globalEntity(query: ProfileQuery): typeof GlobalCharacterAggregateEntity | typeof GlobalOutfitAggregateEntity {
        return query.type === 'character' ? GlobalCharacterAggregateEntity : GlobalOutfitAggregateEntity;
    }

    private keyOf(query: ProfileQuery): string {
        return `${query.type}:${query.id}:W${query.world ?? 0}:D${query.days ?? 0}`;
    }

    private async cached<T>(key: string, produce: () => Promise<T>): Promise<T> {
        const cacheKey = `cache:profiles:${key}`;
        const hit = await this.cacheService.get<T>(cacheKey);

        if (hit) {
            return hit;
        }

        const running = this.inFlight.get(cacheKey) as Promise<T> | undefined;

        if (running) {
            return await running;
        }

        const promise = produce()
            .then(async (value) => await this.cacheService.set(cacheKey, value, this.cacheTtl))
            .finally(() => this.inFlight.delete(cacheKey));

        this.inFlight.set(cacheKey, promise);
        return await promise;
    }
}
