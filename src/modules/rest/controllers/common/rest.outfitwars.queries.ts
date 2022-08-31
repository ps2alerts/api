import {Phase} from '../../../data/ps2alerts-constants/outfitwars/phase';

export const PHASE_IMPLICIT_QUERY = {
    name: 'phase',
    required: false,
    type: Phase,
};

export const ROUND_IMPLICIT_QUERY = {
    name: 'round',
    required: false,
    type: Number,
};

export const OUTFITWARS_IMPLICIT_QUERIES = [
    PHASE_IMPLICIT_QUERY,
    ROUND_IMPLICIT_QUERY,
];
