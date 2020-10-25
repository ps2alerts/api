export default class Pagination {
    private readonly take: number | undefined;
    private readonly skip: number | undefined;
    private readonly order: {[k: string]: string} | undefined;

    public constructor(pageQuery: {sortBy?: string, order?: string, pageSize?: number, page?: number}) {
        if (pageQuery.pageSize) {
            this.take = pageQuery.pageSize;
        }

        if (pageQuery.pageSize && pageQuery.page) {
            this.skip = (pageQuery.page - 1) * pageQuery.pageSize;
        }

        if (pageQuery.sortBy) {
            this.order = {
                [pageQuery.sortBy]: pageQuery.order ? pageQuery.order.toUpperCase() : 'ASC',
            };
        }
    }
}
