export default class Pagination {
    private readonly take: number | undefined;
    private readonly skip: number | undefined;
    private readonly order: {[k: string]: string} | undefined;

    public constructor(pageQuery: {sortBy?: string, order?: string, pageSize?: number, page?: number}, limited = false) {
        const requested = pageQuery.pageSize && pageQuery.pageSize > 0 ? Math.min(pageQuery.pageSize, 1000) : undefined;

        // Limited endpoints always cap; unlimited ones return everything unless a size was asked for
        this.take = requested ?? (limited ? 100 : undefined);

        if (requested && pageQuery.page && pageQuery.page > 1) {
            this.skip = (pageQuery.page - 1) * requested;
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
