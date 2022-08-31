import {PAGINATION_IMPLICIT_QUERIES} from './rest.pagination.queries';
import {WORLD_IMPLICIT_QUERY} from './rest.world.query';
import {PS2ALERTS_EVENT_TYPE_QUERY} from './rest.ps2AlertsEventType.query';
import {BRACKET_IMPLICIT_QUERY} from './rest.bracket.query';
import {INSTANCE_IMPLICIT_QUERY} from './rest.instance.query';

export const COMMON_IMPLICIT_QUERIES = [
    WORLD_IMPLICIT_QUERY,
    ...PAGINATION_IMPLICIT_QUERIES,
];

export const AGGREGATE_GLOBAL_COMMON_IMPLICIT_QUERIES = [
    ...COMMON_IMPLICIT_QUERIES,
    BRACKET_IMPLICIT_QUERY,
    PS2ALERTS_EVENT_TYPE_QUERY,
];

export const AGGREGATE_INSTANCE_COMMON_IMPLICIT_QUERIES = [
    INSTANCE_IMPLICIT_QUERY,
    PS2ALERTS_EVENT_TYPE_QUERY,
    ...PAGINATION_IMPLICIT_QUERIES,
];
