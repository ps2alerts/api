import {PAGINATION_IMPLICIT_QUERIES} from './rest.pagination.queries';
import {WORLD_IMPLICIT_QUERY} from './rest.world.query';
import {ZONE_IMPLICIT_QUERY} from './rest.zone.query';
import {BRACKET_IMPLICIT_QUERY} from './rest.bracket.query';

export const COMMON_IMPLICIT_QUERIES = [
    WORLD_IMPLICIT_QUERY,
    ZONE_IMPLICIT_QUERY,
    BRACKET_IMPLICIT_QUERY,
    ...PAGINATION_IMPLICIT_QUERIES,
];
