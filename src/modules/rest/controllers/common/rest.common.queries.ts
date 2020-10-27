import {PAGINATION_IMPLICIT_QUERIES} from './rest.pagination.queries';
import {WORLD_IMPLICIT_QUERY} from './rest.world.query';

export const COMMON_IMPLICIT_QUERIES = [
    WORLD_IMPLICIT_QUERY,
    ...PAGINATION_IMPLICIT_QUERIES,
];
