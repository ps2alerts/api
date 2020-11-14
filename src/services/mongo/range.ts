export default class Range {
    private readonly field: string;
    private readonly from: string | number | undefined;
    private readonly to: string | number | undefined;

    public constructor(field: string, from: string | number | undefined, to?: string | number | undefined) {
        this.field = field;
        this.from = from;

        if (this.to) {
            this.to = to;
        }
    }

    public build(): any {
        let obj = {};

        if (this.from && this.to) {
            obj = {
                [this.field]: {
                    $gte: this.from,
                    $lte: this.to,
                },
            };
        }

        if (this.from && !this.to) {
            obj = {
                [this.field]: {
                    $gte: this.from,
                },
            };
        }

        return obj;
    }
}
