export interface ClientRequest {
    client: string;
    bytes: number;
    durationMs: number;
    userAgent: string;
    country: string;
    route: string;
}

export interface ClientSnapshot {
    client: string;
    requests: number;
    peakPerMinute: number;
    bytes: number;
    durationMs: number;
    userAgent: string;
    country: string;
    routes: Array<{route: string, requests: number}>;
}

export interface TrafficSnapshot {
    windowSeconds: number;
    totals: {requests: number, bytes: number, clients: number, overflowRequests: number};
    top: ClientSnapshot[];
    topByPeak: ClientSnapshot[];
}

interface ClientStats {
    requests: number;
    bytes: number;
    durationMs: number;
    userAgent: string;
    country: string;
    routes: Map<string, number>;
}

interface Bucket {
    slot: number;
    clients: Map<string, ClientStats>;
    overflowRequests: number;
}

interface Merged extends ClientStats {
    perSlot: number[];
}

const MAX_ROUTES_PER_CLIENT = 20;
const MAX_UA_LENGTH = 120;

// Per-client request counts over a rolling window of short buckets, held in memory only.
// Short buckets let it report each client's busiest 60 seconds, not just the window total.
export class ClientTrafficTracker {
    private readonly buckets: Bucket[];
    private readonly bucketMs: number;
    private readonly bucketsPerMinute: number;

    constructor(
        private readonly windowSeconds = 300,
        bucketSeconds = 5,
        private readonly maxClientsPerBucket = 5000,
        private readonly now: () => number = Date.now,
    ) {
        this.bucketMs = bucketSeconds * 1000;
        this.bucketsPerMinute = Math.max(1, Math.round(60 / bucketSeconds));
        const count = Math.round(windowSeconds / bucketSeconds);
        this.buckets = Array.from({length: count}, () => ({slot: -1, clients: new Map<string, ClientStats>(), overflowRequests: 0}));
    }

    public record(req: ClientRequest): void {
        const bucket = this.currentBucket();
        let stats = bucket.clients.get(req.client);

        if (!stats) {
            if (bucket.clients.size >= this.maxClientsPerBucket) {
                bucket.overflowRequests++;
                return;
            }

            stats = {requests: 0, bytes: 0, durationMs: 0, userAgent: '', country: '', routes: new Map<string, number>()};
            bucket.clients.set(req.client, stats);
        }

        stats.requests++;
        stats.bytes += req.bytes;
        stats.durationMs += req.durationMs;
        stats.userAgent = req.userAgent.slice(0, MAX_UA_LENGTH);
        stats.country = req.country.slice(0, 2);

        const route = stats.routes.has(req.route) || stats.routes.size < MAX_ROUTES_PER_CLIENT ? req.route : 'other';
        stats.routes.set(route, (stats.routes.get(route) ?? 0) + 1);
    }

    public snapshot(limit = 10): TrafficSnapshot {
        const n = this.buckets.length;
        const oldest = this.slotNow() - n + 1;
        const merged = new Map<string, Merged>();
        const totals = {requests: 0, bytes: 0, clients: 0, overflowRequests: 0};

        // Oldest first, so each client keeps the user agent of its newest request. These become
        // alert labels, and a label that flips between evaluations restarts the alert.
        const buckets = this.buckets.filter((b) => b.slot >= oldest).sort((a, b) => a.slot - b.slot);

        for (const bucket of buckets) {
            totals.overflowRequests += bucket.overflowRequests;

            for (const [client, s] of bucket.clients) {
                const m = merged.get(client) ?? ClientTrafficTracker.emptyMerged(n);
                m.requests += s.requests;
                m.bytes += s.bytes;
                m.durationMs += s.durationMs;
                m.userAgent = s.userAgent;
                m.country = s.country;
                m.perSlot[bucket.slot - oldest] += s.requests;

                for (const [route, count] of s.routes) {
                    m.routes.set(route, (m.routes.get(route) ?? 0) + count);
                }

                merged.set(client, m);
                totals.requests += s.requests;
                totals.bytes += s.bytes;
            }
        }

        totals.clients = merged.size;

        const all = [...merged.entries()].map(([client, s]) => this.toSnapshot(client, s));

        return {
            windowSeconds: this.windowSeconds,
            totals,
            top: [...all].sort((a, b) => b.requests - a.requests).slice(0, limit),
            topByPeak: [...all].sort((a, b) => b.peakPerMinute - a.peakPerMinute).slice(0, limit),
        };
    }

    private static emptyMerged(slots: number): Merged {
        return {requests: 0, bytes: 0, durationMs: 0, userAgent: '', country: '', routes: new Map<string, number>(), perSlot: new Array<number>(slots).fill(0)};
    }

    private toSnapshot(client: string, s: Merged): ClientSnapshot {
        const routes = [...s.routes.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([route, requests]) => ({route, requests}));

        return {
            client,
            requests: s.requests,
            peakPerMinute: this.busiestMinute(s.perSlot),
            bytes: s.bytes,
            durationMs: Math.round(s.durationMs),
            userAgent: s.userAgent,
            country: s.country,
            routes,
        };
    }

    private busiestMinute(perSlot: number[]): number {
        let sum = 0;
        let peak = 0;

        for (let i = 0; i < perSlot.length; i++) {
            sum += perSlot[i];

            if (i >= this.bucketsPerMinute) {
                sum -= perSlot[i - this.bucketsPerMinute];
            }

            peak = Math.max(peak, sum);
        }

        return peak;
    }

    private slotNow(): number {
        return Math.floor(this.now() / this.bucketMs);
    }

    private currentBucket(): Bucket {
        const slot = this.slotNow();
        const bucket = this.buckets[slot % this.buckets.length];

        if (bucket.slot !== slot) {
            bucket.slot = slot;
            bucket.clients.clear();
            bucket.overflowRequests = 0;
        }

        return bucket;
    }
}
