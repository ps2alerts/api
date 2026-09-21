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

export interface FactionKills {
    vs: number;
    nc: number;
    tr: number;
    nso: number;
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
    // Outfits only: facility captures and the average number of members taking part
    captures: number;
    participants: number;
    xpmAlerts: number;
    // Per-minute averages over the alerts that have them (per participant for outfits)
    kpm: number;
    dpm: number;
    tkpm: number;
    spm: number;
    hspm: number;
    // Outfits only: kills and deaths per minute per participating member
    ppKpm: number;
    ppDpm: number;
    wins: number;
    decided: number;
    factionKills: FactionKills;
}

export interface ProfileSummary {
    type: ProfileType;
    id: string;
    world: World;
    days: number | null;
    // The global TOTAL aggregate for the character or outfit, including the embedded identity
    identity: Record<string, unknown>;
    faction: Faction;
    // Outfits only: the leader as last seen
    leader?: {id: string, name: string, world: World} | null;
    totals: ProfileBracketTotals;
    brackets: Record<number, ProfileBracketTotals>;
    firstAlert: Date | null;
    lastAlert: Date | null;
    // Per-minute tracking arrived mid-2022; alerts before this have no KPM/DPM
    firstTrackedAlert: Date | null;
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

export interface ProfileVehicleRow {
    vehicle: number;
    vehicleKills: number;
    infantryKills: number;
    deaths: number;
    teamKills: number;
    teamKilled: number;
    roadkills: number;
    suicides: number;
}
