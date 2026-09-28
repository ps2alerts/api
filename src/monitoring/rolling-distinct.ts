interface Bucket {
    minute: number;
    members: Map<string, Set<string>>;
}

// Distinct members per key over a rolling window of one-minute buckets, e.g. viewers per alert.
export class RollingDistinct {
    private readonly buckets: Bucket[];

    constructor(
        private readonly windowMinutes = 5,
        private readonly maxKeysPerBucket = 500,
        private readonly maxMembersPerKey = 20000,
        private readonly now: () => number = Date.now,
    ) {
        this.buckets = Array.from({length: windowMinutes}, () => ({minute: -1, members: new Map<string, Set<string>>()}));
    }

    public add(key: string, member: string): void {
        const minute = Math.floor(this.now() / 60000);
        const bucket = this.buckets[minute % this.windowMinutes];

        if (bucket.minute !== minute) {
            bucket.minute = minute;
            bucket.members.clear();
        }

        let set = bucket.members.get(key);

        if (!set) {
            if (bucket.members.size >= this.maxKeysPerBucket) {
                return;
            }

            set = new Set<string>();
            bucket.members.set(key, set);
        }

        if (set.size < this.maxMembersPerKey) {
            set.add(member);
        }
    }

    public counts(): Map<string, number> {
        const oldest = Math.floor(this.now() / 60000) - this.windowMinutes + 1;
        const union = new Map<string, Set<string>>();

        for (const bucket of this.buckets) {
            if (bucket.minute < oldest) {
                continue;
            }

            for (const [key, set] of bucket.members) {
                const u = union.get(key) ?? new Set<string>();
                set.forEach((m) => u.add(m));
                union.set(key, u);
            }
        }

        return new Map([...union.entries()].map(([key, set]) => [key, set.size]));
    }
}
