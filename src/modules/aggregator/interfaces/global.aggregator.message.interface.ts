/* eslint-disable @typescript-eslint/no-explicit-any */
import {Bracket} from '../../data/ps2alerts-constants/bracket';

export default interface GlobalAggregatorMessageInterface {
    instance: string;
    bracket?: Bracket;
    docs: any[];
    conditionals: any[];
}
