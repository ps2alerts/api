import Pagination from './pagination';

describe('Pagination', () => {
    it('returns everything on an unlimited endpoint when no page size is asked for', () => {
        expect(new Pagination({}).getKey()).toBe('O:undefined-T:undefined-S:undefined');
    });

    it('caps a limited endpoint at 100 rows by default', () => {
        expect(new Pagination({}, true).getKey()).toBe('O:undefined-T:100-S:undefined');
    });

    it('honours a requested page size up to 1000', () => {
        expect(new Pagination({pageSize: 250}, true).getKey()).toContain('T:250');
        expect(new Pagination({pageSize: 5000}, true).getKey()).toContain('T:1000');
    });

    it('skips whole pages of the requested size', () => {
        expect(new Pagination({pageSize: 20, page: 3}).getKey()).toContain('T:20-S:40');
    });

    it('sorts ascending unless told otherwise', () => {
        expect(new Pagination({sortBy: 'kills'}).getKey()).toContain('O:{"kills":"ASC"}');
        expect(new Pagination({sortBy: 'kills', order: 'desc'}).getKey()).toContain('O:{"kills":"DESC"}');
    });
});
