export default class Range {
    private readonly field: string;
    private readonly from: string | Date | undefined;
    private readonly to: string | Date | undefined;

    public constructor(field: string, from: Date | undefined, to: Date | undefined = undefined) {
        this.field = field;
        this.from = from instanceof Date ? from : from;
        this.to = to instanceof Date ? to : to;
    }

    public build(): Record<string, unknown> | undefined {
        if (this.from && this.to) {
            return {
                $gte: this.from,
                $lte: this.to,
            };
        }

        if (this.from && !this.to) {
            return {
                $gte: this.from,
            };
        }

        return undefined;
    }
}
