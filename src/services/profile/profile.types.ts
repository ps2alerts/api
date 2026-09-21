import {Bracket} from '../../modules/data/ps2alerts-constants/bracket';
import {World} from '../../modules/data/ps2alerts-constants/world';
import {Faction} from '../../modules/data/ps2alerts-constants/faction';

export type ProfileType = 'character' | 'outfit';

export type TimelineGranularity = 'day' | 'week' | 'month' | 'year';

export interface ProfileQuery {
    type: ProfileType;
    id: string;
    world?: World;
    days?: number;
}

export interface ProfileBracketTotals {
    bracket: Bracket;
    alerts: number;
    kills: number;
    deaths: number;
    headshots: number;
    teamKills: number;
    teamKilled: number;
    suicides: number;
    xpmAlerts: number;
    kpm: number;
    dpm: number;
    wins: number;
    decided: number;
}

export interface ProfileSummary {
    type: ProfileType;
    id: string;
    world: World;
    days: number | null;
    // The global TOTAL aggregate for the character or outfit, including the embedded identity
    identity: Record<string, unknown>;
    faction: Faction;
    totals: ProfileBracketTotals;
    brackets: Record<number, ProfileBracketTotals>;
    firstAlert: Date | null;
    lastAlert: Date | null;
}

export interface ProfileTimelineRow {
    bucket: Date;
    bracket: Bracket;
    alerts: number;
    kills: number;
    deaths: number;
    headshots: number;
    teamKills: number;
    teamKilled: number;
    suicides: number;
    xpmAlerts: number;
    kpmTotal: number;
    dpmTotal: number;
}

export interface ProfileAlertRow {
    instance: string;
    kills: number;
    deaths: number;
    headshots: number;
    teamKills: number;
    teamKilled: number;
    suicides: number;
    participants?: number;
    battleRank?: number;
    outfit?: Record<string, unknown>;
    details: {
        world: World;
        zone: number;
        bracket: Bracket;
        state: number;
        timeStarted: Date;
        timeEnded: Date | null;
        victor: Faction | null;
        draw: boolean;
    } | null;
}

export interface ProfileAlertsPage {
    items: ProfileAlertRow[];
    total: number;
    page: number;
    pageSize: number;
}

export interface ProfileMemberRow {
    character: {
        id: string;
        name: string;
        faction: Faction;
        world: World;
        battleRank: number;
        adjustedBattleRank?: number;
        asp?: number;
    };
    kills: number;
    deaths: number;
    headshots: number;
    teamKills: number;
    suicides: number;
}

export interface ProfileMembersPage {
    items: ProfileMemberRow[];
    total: number;
    page: number;
    pageSize: number;
}
