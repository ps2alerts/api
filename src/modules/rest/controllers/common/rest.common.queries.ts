import {PAGINATION_IMPLICIT_QUERIES} from './rest.pagination.queries';
import {WORLD_IMPLICIT_QUERY} from './rest.world.query';
import {PS2ALERTS_EVENT_TYPE_QUERY} from './rest.ps2AlertsEventType.query';
import {BRACKET_IMPLICIT_QUERY} from './rest.bracket.query';

export const COMMON_IMPLICIT_QUERIES = [
    WORLD_IMPLICIT_QUERY,
    ...PAGINATION_IMPLICIT_QUERIES,
];

export const AGGREGATE_COMMON_IMPLICIT_QUERIES = [
    ...COMMON_IMPLICIT_QUERIES,
    BRACKET_IMPLICIT_QUERY,
    PS2ALERTS_EVENT_TYPE_QUERY,
];
