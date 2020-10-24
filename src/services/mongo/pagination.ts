export default class Pagination {
    private readonly sortBy: string;
    private readonly order: string;
    private readonly page: number; // Starts from 1
    private readonly pageSize: number;

    // Defaults
    private constructor(
        sortBy: string = "_id",
        order: string = "ASC",
        page: number = 1,
        pageSize: number = 100,
    ) {
        this.sortBy = sortBy;
        this.order = order;
        this.page = page;
        this.pageSize = pageSize;
    }

    private toFindOptions(): object {
        return {
            take: this.pageSize,
            skip: ((this.page - 1) * this.pageSize),
            order: {
                [this.sortBy]: this.order
            },
        };
    }

    public static create(
        sortBy: string | undefined,
        order: string | undefined,
        page: number | undefined,
        pageSize: number | undefined,
    ): object {
        if (sortBy === undefined && order === undefined && page === undefined && pageSize === undefined) {
            return {};
        }
        return new Pagination(sortBy, order, page, pageSize).toFindOptions();
    }
}
