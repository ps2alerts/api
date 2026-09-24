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
    minute: number;
    clients: Map<string, ClientStats>;
    overflowRequests: number;
}

const MAX_ROUTES_PER_CLIENT = 20;
const MAX_UA_LENGTH = 120;

// Per-client request counts over a rolling window of one-minute buckets, held in memory only.
export class ClientTrafficTracker {
    private readonly buckets: Bucket[];
    private readonly maxClientsPerBucket: number;

    constructor(
        private readonly windowMinutes = 5,
        maxClients = 5000,
        private readonly now: () => number = Date.now,
    ) {
        this.buckets = Array.from({length: windowMinutes}, () => ({minute: -1, clients: new Map<string, ClientStats>(), overflowRequests: 0}));
        this.maxClientsPerBucket = Math.ceil(maxClients / windowMinutes);
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
        const oldest = this.minuteNow() - this.windowMinutes + 1;
        const merged = new Map<string, ClientStats>();
        const totals = {requests: 0, bytes: 0, clients: 0, overflowRequests: 0};

        // Oldest first, so each client keeps the user agent of its newest request. These become
        // alert labels, and a label that flips between evaluations restarts the alert.
        const buckets = this.buckets.filter((b) => b.minute >= oldest).sort((a, b) => a.minute - b.minute);

        for (const bucket of buckets) {
            totals.overflowRequests += bucket.overflowRequests;

            for (const [client, s] of bucket.clients) {
                const m = merged.get(client) ?? {requests: 0, bytes: 0, durationMs: 0, userAgent: '', country: '', routes: new Map<string, number>()};
                m.requests += s.requests;
                m.bytes += s.bytes;
                m.durationMs += s.durationMs;
                m.userAgent = s.userAgent;
                m.country = s.country;

                for (const [route, n] of s.routes) {
                    m.routes.set(route, (m.routes.get(route) ?? 0) + n);
                }

                merged.set(client, m);
                totals.requests += s.requests;
                totals.bytes += s.bytes;
            }
        }

        totals.clients = merged.size;

        const top = [...merged.entries()]
            .sort((a, b) => b[1].requests - a[1].requests)
            .slice(0, limit)
            .map(([client, s]) => ClientTrafficTracker.toSnapshot(client, s));

        return {windowSeconds: this.windowMinutes * 60, totals, top};
    }

    private static toSnapshot(client: string, s: ClientStats): ClientSnapshot {
        const routes = [...s.routes.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([route, requests]) => ({route, requests}));

        return {
            client,
            requests: s.requests,
            bytes: s.bytes,
            durationMs: Math.round(s.durationMs),
            userAgent: s.userAgent,
            country: s.country,
            routes,
        };
    }

    private minuteNow(): number {
        return Math.floor(this.now() / 60000);
    }

    private currentBucket(): Bucket {
        const minute = this.minuteNow();
        const bucket = this.buckets[minute % this.windowMinutes];

        if (bucket.minute !== minute) {
            bucket.minute = minute;
            bucket.clients.clear();
            bucket.overflowRequests = 0;
        }

        return bucket;
    }
}
