import {ObjectLiteral} from 'typeorm';

export default class ApiQuery {
    public readonly filter: ObjectLiteral;
    public readonly sort: ObjectLiteral;
    public readonly limit: number;
    public readonly skip: number | null;

    public constructor(filter?: ObjectLiteral, sort?: ObjectLiteral, limit?: number, skip?: number) {
        this.filter = filter ? filter : {};
        this.sort = sort ? sort : {};
        this.limit = !limit ? 100 : limit > 100 ? 100 : limit; // If no limit supplied, default to max (100). If limit is more than 100, set to 100, otherwise use requested limit.
        this.skip = skip ? skip : null;
    }
}
