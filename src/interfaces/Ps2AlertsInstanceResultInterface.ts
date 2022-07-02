import {Faction} from '../modules/data/ps2alerts-constants/faction';

export default interface Ps2AlertsInstanceResultInterface {
    vs: number;
    nc: number;
    tr: number;
    cutoff: number;
    outOfPlay: number;
    victor: Faction | null;
    draw: boolean;
    perBasePercentage: number;
}
