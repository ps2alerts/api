/* eslint-disable @typescript-eslint/no-explicit-any */
import {Bracket} from '../../data/constants/bracket.consts';

export default interface GlobalAggregatorMessageInterface {
    instance: string;
    bracket?: Bracket;
    docs: any[];
    conditionals: any[];
}
