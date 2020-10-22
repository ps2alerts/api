export default class Pagination {
    private sortBy: string;
    private order: "ASC" | "DESC";
    private page: number;   // Starts from 1
    private pageSize: number;

    // Defaults
    private constructor(sortBy:string = "_id", order:"ASC" | "DESC" = "ASC", page:number = 1, pageSize:number = 100) {
        this.sortBy = sortBy;
        this.order = order;
        this.page = page;
        this.pageSize = pageSize;
    }

    private toFindOptions() {
        console.log(this);
        return {
            take: this.pageSize,
            skip: ((this.page - 1) * this.pageSize),
            order: {
                [this.sortBy]: this.order
            }
        }
    }

    public static create(sortBy: any, order: any, page: any, pageSize: any){
        if(sortBy == undefined && order == undefined && page == undefined && pageSize == undefined){
            return {};
        }
        return new Pagination(sortBy, order, page, pageSize).toFindOptions();
    }

}
