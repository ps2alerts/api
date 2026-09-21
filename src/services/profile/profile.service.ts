/* eslint-disable @typescript-eslint/naming-convention,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call */
import {Inject, Injectable, NotFoundException} from '@nestjs/common';
import MongoOperationsService from '../mongo/mongo.operations.service';
import {RedisCacheService} from '../cache/redis.cache.service';
import Pagination from '../mongo/pagination';
import InstanceCharacterAggregateEntity from '../../modules/data/entities/aggregate/instance/instance.character.aggregate.entity';
import InstanceOutfitAggregateEntity from '../../modules/data/entities/aggregate/instance/instance.outfit.aggregate.entity';
import GlobalCharacterAggregateEntity from '../../modules/data/entities/aggregate/global/global.character.aggregate.entity';
import GlobalOutfitAggregateEntity from '../../modules/data/entities/aggregate/global/global.outfit.aggregate.entity';
import {Bracket} from '../../modules/data/ps2alerts-constants/bracket';
import {Ps2AlertsEventType} from '../../modules/data/ps2alerts-constants/ps2AlertsEventType';
import {Ps2AlertsEventState} from '../../modules/data/ps2alerts-constants/ps2AlertsEventState';
import GlobalVehicleCharacterAggregateEntity from '../../modules/data/entities/aggregate/global/global.vehicle.character.aggregate.entity';
import InstanceVehicleCharacterAggregateEntity from '../../modules/data/entities/aggregate/instance/instance.vehicle.character.aggregate.entity';
import {
    FactionKills,
    ProfileAlertRow,
    ProfileAlertsPage,
    ProfileMemberRow,
    ProfileBracketTotals,
    ProfileMembersPage,
    ProfileVehicleRow,
    ProfileQuery,
    ProfileSummary,
    ProfileTimelineRow,
    ProfileType,
    TimelineGranularity,
} from './profile.types';

const PROFILE_BRACKETS = [Bracket.DEAD, Bracket.LOW, Bracket.MEDIUM, Bracket.HIGH, Bracket.PRIME];
const COMBAT_FIELDS = ['kills', 'deaths', 'headshots', 'teamKills', 'teamKilled', 'suicides', 'captures'];
const FACTION_KEYS: Record<number, keyof FactionKills> = {1: 'vs', 2: 'nc', 3: 'tr', 4: 'nso'};
// Outfits carry the per-minute set twice: the outfit's total and the average per participating member
const XPM_FIELDS: Record<string, Record<string, string>> = {
    character: {kpm: 'killsPerMinute', dpm: 'deathsPerMinute', tkpm: 'teamKillsPerMinute', spm: 'suicidesPerMinute', hspm: 'headshotsPerMinute'},
    outfit: {
        kpm: 'killsPerMinute',
        dpm: 'deathsPerMinute',
        tkpm: 'teamKillsPerMinute',
        spm: 'suicidesPerMinute',
        hspm: 'headshotsPerMinute',
        ppKpm: 'killsPerMinutePerParticipant',
        ppDpm: 'deathsPerMinutePerParticipant',
    },
};

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
    // No single profile query may hold the shared production host for longer than this
    private readonly queryOptions = {maxTimeMS: 30000};
    // Coalesces concurrent cold requests for the same key so an expensive pipeline runs once
    private readonly inFlight = new Map<string, Promise<unknown>>();

    constructor(
        @Inject(MongoOperationsService) private readonly mongoOperationsService: MongoOperationsService,
        private readonly cacheService: RedisCacheService,
    ) {}

    public async summary(query: ProfileQuery): Promise<ProfileSummary> {
        return (await this.base(query)).summary;
    }

    public async timeline(query: ProfileQuery, granularity: TimelineGranularity): Promise<ProfileTimelineRow[]> {
        const daily = (await this.base(query)).daily;

        if (granularity === 'day') {
            return daily;
        }

        // Fold the cached daily rows into the requested bucket size rather than scanning the alerts again
        const buckets = new Map<string, ProfileTimelineRow>();

        daily.forEach((row) => {
            const bucket = this.bucketStart(new Date(row.bucket), granularity);
            const key = `${bucket.toISOString()}:${row.bracket}`;
            const entry = buckets.get(key) ?? {...row, bucket, alerts: 0, kills: 0, deaths: 0, headshots: 0, teamKills: 0, teamKilled: 0, suicides: 0, xpmAlerts: 0, kpmTotal: 0, dpmTotal: 0};

            (['alerts', 'kills', 'deaths', 'headshots', 'teamKills', 'teamKilled', 'suicides', 'xpmAlerts', 'kpmTotal', 'dpmTotal'] as const).forEach((field) => {
                entry[field] += row[field];
            });
            buckets.set(key, entry);
        });

        return [...buckets.values()].sort((a, b) => a.bucket.getTime() - b.bucket.getTime() || a.bracket - b.bracket);
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

        query = await this.withWorld(query);

        return await this.cached(`alerts:${this.keyOf(query)}:${pageNumber}:${size}:${sortField}:${direction}`, async () => {
            // Instance ids sort chronologically within a world, which keeps the default order cheap; the tiebreak must not
            // overwrite the requested direction when the sort field is the instance itself
            const sort = {$sort: sortField === 'instance' ? {instance: direction} : {[sortField]: direction, instance: -1}};
            const pageStages = [{$skip: (pageNumber - 1) * size}, {$limit: size}];
            const needsJoinFirst = sortField.startsWith('details.') || !!query.days;

            // Joining only the page being returned is far cheaper than joining every alert first; the count comes
            // from the index rather than a $facet, which would read every row
            const pipeline = needsJoinFirst
                ? [...this.matchAndJoin(query), sort, ...pageStages, ALERT_PROJECTION]
                : [this.matchStage(query), sort, ...pageStages, ...this.joinStages(), ALERT_PROJECTION];

            // The total is the same for every page and sort of one query, so it is cached on its own
            const [items, total] = await Promise.all([
                this.mongoOperationsService.aggregate<ProfileAlertRow>(this.instanceEntity(query), pipeline, this.queryOptions),
                this.cached(`alertsCount:${this.keyOf(query)}`, async () => (needsJoinFirst
                    ? await this.mongoOperationsService.aggregate<Record<string, any>>(this.instanceEntity(query), [...this.matchAndJoin(query), {$count: 'count'}], this.queryOptions).then((rows) => Number(rows[0]?.count ?? 0))
                    : await this.mongoOperationsService.em.count(this.instanceEntity(query), (this.matchStage(query) as {$match: Record<string, unknown>}).$match))),
            ]);

            return {items, total, page: pageNumber, pageSize: size};
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

        query = await this.withWorld(query);

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

            const [items, total] = await Promise.all([
                this.mongoOperationsService.aggregate<ProfileMemberRow>(GlobalCharacterAggregateEntity, [
                    {$match: match},
                    {$sort: {[sortField]: direction, 'character.id': 1}},
                    {$skip: (pageNumber - 1) * size},
                    {$limit: size},
                    {$project: {_id: 0, character: 1, kills: 1, deaths: 1, headshots: 1, teamKills: 1, suicides: 1}},
                ], this.queryOptions),
                this.cached(`membersCount:${query.id}:W${query.world ?? 0}:${term}`, async () => await this.mongoOperationsService.em.count(GlobalCharacterAggregateEntity, match)),
            ]);

            return {items, total, page: pageNumber, pageSize: size};
        });
    }

    // Per-vehicle combat for a character: the global aggregates all-time, or the per-alert ones under a days filter
    public async vehicles(query: ProfileQuery): Promise<ProfileVehicleRow[]> {
        query = await this.withWorld(query);

        return await this.cached(`vehicles:${this.keyOf(query)}`, async () => {
            const sums = {
                vehicleKills: {$sum: {$ifNull: ['$vehicles.kills', 0]}},
                infantryKills: {$sum: {$ifNull: ['$infantry.kills', 0]}},
                deaths: {$sum: {$add: [{$ifNull: ['$vehicles.deaths', 0]}, {$ifNull: ['$infantry.deaths', 0]}]}},
                teamKills: {$sum: {$add: [{$ifNull: ['$vehicles.teamkills', 0]}, {$ifNull: ['$infantry.teamkills', 0]}]}},
                teamKilled: {$sum: {$add: [{$ifNull: ['$vehicles.teamkilled', 0]}, {$ifNull: ['$infantry.teamkilled', 0]}]}},
                roadkills: {$sum: {$ifNull: ['$roadkills', 0]}},
                suicides: {$sum: {$ifNull: ['$suicides', 0]}},
            };
            const match: Record<string, unknown> = {character: query.id, ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME};
            let rows: Array<Record<string, any>>;

            if (query.days) {
                // Per-alert vehicle rows carry no world of their own, so the joined instance supplies it
                const joined: Record<string, unknown> = {'details.timeStarted': {$gte: this.since(query.days)}};

                if (query.world) {
                    joined['details.world'] = query.world;
                }

                rows = await this.mongoOperationsService.aggregate(InstanceVehicleCharacterAggregateEntity, [
                    {$match: match},
                    ...this.joinStages(),
                    {$match: joined},
                    {$group: {_id: '$vehicle', ...sums}},
                ], this.queryOptions);
            } else {
                match.bracket = Bracket.TOTAL;

                if (query.world) {
                    match.world = query.world;
                }

                rows = await this.mongoOperationsService.aggregate(GlobalVehicleCharacterAggregateEntity, [
                    {$match: match},
                    {$group: {_id: '$vehicle', ...sums}},
                ], this.queryOptions);
            }

            const parsed: ProfileVehicleRow[] = rows.map((row) => ({
                vehicle: Number(row._id),
                vehicleKills: Number(row.vehicleKills ?? 0),
                infantryKills: Number(row.infantryKills ?? 0),
                deaths: Number(row.deaths ?? 0),
                teamKills: Number(row.teamKills ?? 0),
                teamKilled: Number(row.teamKilled ?? 0),
                roadkills: Number(row.roadkills ?? 0),
                suicides: Number(row.suicides ?? 0),
            }));

            return parsed.sort((a, b) => (b.vehicleKills + b.infantryKills) - (a.vehicleKills + a.infantryKills));
        });
    }

    /**
     * One scan of the subject's alerts produces both the summary and a per-day timeline, since reading the rows is the
     * expensive part (an outfit can have tens of thousands) and every coarser timeline derives from the daily one.
     */
    private async base(query: ProfileQuery): Promise<{summary: ProfileSummary, daily: ProfileTimelineRow[]}> {
        return await this.cached(`base:${this.keyOf(query)}`, async () => {
            const globals: Array<Record<string, any>> = await this.mongoOperationsService.findMany(
                this.globalEntity(query),
                {[`${query.type}.id`]: query.id, ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME, world: query.world},
            );
            // An id can exist on several worlds; without a requested world the busiest one wins, and everything below sticks to it
            const identity = [...globals]
                .filter((doc) => doc.bracket === Bracket.TOTAL)
                .sort((a, b) => Number(b.kills ?? 0) - Number(a.kills ?? 0))[0] ?? globals[0];

            if (!identity) {
                throw new NotFoundException(`No ${query.type} found with ID ${query.id}`);
            }

            const worldGlobals = globals.filter((doc) => doc.world === identity.world);
            const faction = Number(identity[query.type].faction);
            const [facets]: Array<Record<string, any>> = await this.mongoOperationsService.aggregate(
                this.instanceEntity(query),
                [
                    ...this.matchAndJoin(query, identity.world),
                    {
                        $facet: {
                            brackets: [
                                {
                                    $group: {
                                        _id: '$details.bracket',
                                        ...this.sumFields(query.type, faction),
                                        firstAlert: {$min: '$details.timeStarted'},
                                        lastAlert: {$max: '$details.timeStarted'},
                                        firstTrackedAlert: {$min: {$cond: [this.isFinite(`$xPerMinutes.${XPM_FIELDS[query.type].kpm}`), '$details.timeStarted', null]}},
                                    },
                                },
                            ],
                            daily: [
                                {$match: {'details.state': Ps2AlertsEventState.ENDED}},
                                {
                                    $group: {
                                        _id: {
                                            bucket: {$dateTrunc: {date: '$details.timeStarted', unit: 'day'}},
                                            bracket: '$details.bracket',
                                        },
                                        ...this.sumFields(query.type, null),
                                    },
                                },
                                {$sort: {'_id.bucket': 1, '_id.bracket': 1}},
                            ],
                        },
                    },
                ],
                this.queryOptions,
            );

            const brackets: Record<number, ProfileBracketTotals> = {};
            const totals = this.emptyTotals(Bracket.TOTAL);
            let firstAlert: Date | null = null;
            let lastAlert: Date | null = null;
            let firstTrackedAlert: Date | null = null;

            (facets?.brackets ?? []).forEach((row: Record<string, any>) => {
                const bracket = Number(row._id);
                const entry = this.rowToTotals(row, bracket);

                if (PROFILE_BRACKETS.includes(bracket)) {
                    brackets[bracket] = entry;
                }

                this.addTotals(totals, entry);
                firstAlert = !firstAlert || row.firstAlert < firstAlert ? row.firstAlert : firstAlert;
                lastAlert = !lastAlert || row.lastAlert > lastAlert ? row.lastAlert : lastAlert;

                if (row.firstTrackedAlert && (!firstTrackedAlert || row.firstTrackedAlert < firstTrackedAlert)) {
                    firstTrackedAlert = row.firstTrackedAlert;
                }
            });

            // All-time views take combat totals from the global aggregates, which also cover alerts that predate per-alert tracking
            if (!query.days) {
                worldGlobals.forEach((doc) => {
                    const target = doc.bracket === Bracket.TOTAL ? totals : brackets[doc.bracket];

                    if (target) {
                        COMBAT_FIELDS.forEach((field) => {
                            (target as unknown as Record<string, number>)[field] = Number(doc[field] ?? 0);
                        });
                        target.factionKills = this.factionKillsOf(doc.factionKills?.[FACTION_KEYS[faction]]);
                    }
                });
            }

            const daily: ProfileTimelineRow[] = (facets?.daily ?? []).map((row: Record<string, any>) => ({
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

            return {
                summary: {
                    type: query.type,
                    id: query.id,
                    world: identity.world,
                    days: query.days ?? null,
                    identity,
                    faction,
                    leader: query.type === 'outfit' ? await this.leaderOf(identity.outfit?.leader, identity.world) : undefined,
                    totals: this.finishTotals(totals),
                    brackets: Object.fromEntries(
                        Object.entries(brackets).map(([bracket, entry]) => [bracket, this.finishTotals(entry)]),
                    ),
                    firstAlert,
                    lastAlert,
                    firstTrackedAlert,
                },
                daily,
            };
        });
    }

    // UTC bucket boundaries, weeks starting Monday, matching $dateTrunc in the daily pass
    private bucketStart(date: Date, granularity: TimelineGranularity): Date {
        const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

        switch (granularity) {
            case 'week':
                d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
                return d;
            case 'month':
                d.setUTCDate(1);
                return d;
            case 'year':
                d.setUTCMonth(0, 1);
                return d;
            default:
                return d;
        }
    }

    // A link without a world still needs one so every index is used with equality on it; the cheapest source is the identity row
    private async withWorld(query: ProfileQuery): Promise<ProfileQuery> {
        if (query.world) {
            return query;
        }

        const world = await this.cached(`world:${query.type}:${query.id}`, async () => {
            const docs: Array<Record<string, any>> = await this.mongoOperationsService.findMany(
                this.globalEntity(query),
                {[`${query.type}.id`]: query.id, bracket: Bracket.TOTAL, ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME},
                new Pagination({sortBy: 'kills', order: 'desc', pageSize: 1}),
            );

            if (!docs[0]) {
                throw new NotFoundException(`No ${query.type} found with ID ${query.id}`);
            }

            return Number(docs[0].world);
        });

        return {...query, world};
    }

    private async leaderOf(leaderId?: string, world?: number): Promise<ProfileSummary['leader']> {
        if (!leaderId || leaderId === '0') {
            return null;
        }

        const docs: Array<Record<string, any>> = await this.mongoOperationsService.findMany(
            GlobalCharacterAggregateEntity,
            {'character.id': leaderId, bracket: Bracket.TOTAL, ps2AlertsEventType: Ps2AlertsEventType.LIVE_METAGAME, world},
        );
        const leader = docs[0]?.character;

        return leader ? {id: leader.id, name: leader.name, world: docs[0].world} : null;
    }

    private factionKillsOf(source?: Record<string, number>): FactionKills {
        return {vs: source?.vs ?? 0, nc: source?.nc ?? 0, tr: source?.tr ?? 0, nso: source?.nso ?? 0};
    }

    private since(days: number): Date {
        return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }

    // Match the subject's per-alert rows and attach the slice of the instance record the profiles need
    private matchAndJoin(query: ProfileQuery, world?: number): Array<Record<string, unknown>> {
        const stages = [this.matchStage(query, world), ...this.joinStages()];

        if (query.days) {
            stages.push({$match: {'details.timeStarted': {$gte: this.since(query.days)}}});
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

    // Group accumulators; `faction` enables win counting and the faction-kill split, null skips both
    private sumFields(type: ProfileType, faction: number | null): Record<string, unknown> {
        const xpm = XPM_FIELDS[type];
        const fields: Record<string, unknown> = {
            alerts: {$sum: 1},
            participants: {$sum: {$ifNull: ['$participants', 0]}},
            // Per-minute figures only exist for alerts tracked since the feature launched, and a few are stored as NaN
            xpmAlerts: {$sum: {$cond: [this.isFinite(`$xPerMinutes.${xpm.kpm}`), 1, 0]}},
            // Victor 0 or null means nobody won; draws are flagged separately
            decided: {$sum: {$cond: [{$and: [{$gt: ['$details.result.victor', 0]}, {$ne: ['$details.result.draw', true]}]}, 1, 0]}},
            wins: {$sum: {$cond: [{$and: [{$ne: ['$details.result.draw', true]}, {$eq: ['$details.result.victor', faction ?? -1]}]}, 1, 0]}},
        };

        COMBAT_FIELDS.forEach((field) => {
            fields[field] = {$sum: {$ifNull: [`$${field}`, 0]}};
        });

        Object.entries(xpm).forEach(([key, path]) => {
            fields[`${key}Total`] = {$sum: {$cond: [this.isFinite(`$xPerMinutes.${path}`), `$xPerMinutes.${path}`, 0]}};
        });

        const factionKey = faction ? FACTION_KEYS[faction] : undefined;
        ['vs', 'nc', 'tr', 'nso'].forEach((victim) => {
            fields[`kills_${victim}`] = factionKey ? {$sum: {$ifNull: [`$factionKills.${factionKey}.${victim}`, 0]}} : {$sum: 0};
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
            captures: row.captures ?? 0,
            participants: row.participants ?? 0,
            xpmAlerts: row.xpmAlerts ?? 0,
            kpm: row.kpmTotal ?? 0,
            dpm: row.dpmTotal ?? 0,
            tkpm: row.tkpmTotal ?? 0,
            spm: row.spmTotal ?? 0,
            hspm: row.hspmTotal ?? 0,
            ppKpm: row.ppKpmTotal ?? 0,
            ppDpm: row.ppDpmTotal ?? 0,
            wins: row.wins ?? 0,
            decided: row.decided ?? 0,
            factionKills: {vs: row.kills_vs ?? 0, nc: row.kills_nc ?? 0, tr: row.kills_tr ?? 0, nso: row.kills_nso ?? 0},
        };
    }

    private emptyTotals(bracket: Bracket): ProfileBracketTotals {
        return {
            bracket,
            alerts: 0,
            kills: 0,
            deaths: 0,
            headshots: 0,
            teamKills: 0,
            teamKilled: 0,
            suicides: 0,
            captures: 0,
            participants: 0,
            xpmAlerts: 0,
            kpm: 0,
            dpm: 0,
            tkpm: 0,
            spm: 0,
            hspm: 0,
            ppKpm: 0,
            ppDpm: 0,
            wins: 0,
            decided: 0,
            factionKills: {vs: 0, nc: 0, tr: 0, nso: 0},
        };
    }

    private addTotals(target: ProfileBracketTotals, source: ProfileBracketTotals): void {
        (Object.keys(source) as Array<keyof ProfileBracketTotals>).forEach((key) => {
            if (key === 'factionKills') {
                (Object.keys(source.factionKills) as Array<keyof FactionKills>).forEach((f) => {
                    target.factionKills[f] += source.factionKills[f];
                });
            } else if (key !== 'bracket') {
                target[key] += source[key];
            }
        });
    }

    // Per-minute figures and participants are summed per alert until here; turn them into averages
    private finishTotals(entry: ProfileBracketTotals): ProfileBracketTotals {
        const perXpm = (total: number): number => (entry.xpmAlerts > 0 ? total / entry.xpmAlerts : 0);

        return {
            ...entry,
            participants: entry.alerts > 0 ? entry.participants / entry.alerts : 0,
            kpm: perXpm(entry.kpm),
            dpm: perXpm(entry.dpm),
            tkpm: perXpm(entry.tkpm),
            spm: perXpm(entry.spm),
            hspm: perXpm(entry.hspm),
            ppKpm: perXpm(entry.ppKpm),
            ppDpm: perXpm(entry.ppDpm),
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
