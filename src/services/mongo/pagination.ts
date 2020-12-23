export default class Pagination {
    private readonly take: number | undefined;
    private readonly skip: number | undefined;
    private readonly order: {[k: string]: string} | undefined;

    public constructor(pageQuery: {sortBy?: string, order?: string, pageSize?: number, page?: number}, endpointNamespace: string) {
        this.take = 100;

        if (pageQuery.pageSize) {
            if (pageQuery.pageSize < 1000) {
                this.take = pageQuery.pageSize;
            } else {
                this.take = 1000;
            }
        }

        if (endpointNamespace === 'instance' && !pageQuery.pageSize) {
            this.take = undefined;
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
