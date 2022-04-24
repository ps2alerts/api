import {Faction} from '../modules/data/constants/faction.consts';

export default interface Ps2AlertsInstanceResultInterface {
    vs: number;
    nc: number;
    tr: number;
    cutoff: number;
    outOfPlay: number;
    victor: Faction | null;
    draw: boolean;
}
