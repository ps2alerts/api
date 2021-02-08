export default class Pagination {
    private readonly take: number | undefined;
    private readonly skip: number | undefined;
    private readonly order: {[k: string]: string} | undefined;

    public constructor(pageQuery: {sortBy?: string, order?: string, pageSize?: number, page?: number}, limited = false) {
        this.take = 100;

        if (pageQuery.pageSize) {
            if (pageQuery.pageSize < 1000) {
                this.take = pageQuery.pageSize;
            } else {
                this.take = 1000;
            }
        }

        if (!limited && !pageQuery.pageSize) {
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

    public getKey(): string {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return `O:${JSON.stringify(this.order)}-T:${this.take}-S:${this.skip}`;
    }
}
