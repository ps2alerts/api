/* eslint-disable @typescript-eslint/naming-convention */
import {FastifyInstance, FastifyRequest} from 'fastify';
import {Counter, Gauge, GaugeConfiguration, Histogram} from 'prom-client';
import {ClientTrafficTracker} from './client-traffic.tracker';
import {RollingDistinct} from './rolling-distinct';
import {isMetricsRequestAllowed, metricsAllowList} from './metrics-access';

const UNTRACKED_ROUTES = new Set(['/metrics', '/healthcheck']);
const ACTIVE_POLL_ROUTE = '/instances/active';
const ALERT_ROUTE_PREFIXES = ['/instances/:instance', '/aggregates/instance/:instance'];

// Registered on the default registry, so /metrics serves it without a handle kept here.
const gauge = (config: GaugeConfiguration<string>): Gauge => new Gauge(config);

const header = (value: string | string[] | undefined): string => (Array.isArray(value) ? value[0] : value) ?? '';

// Cloudflare sets CF-Connecting-IP on every tunnelled request; anything else is a direct caller.
const clientOf = (request: FastifyRequest): string => header(request.headers['cf-connecting-ip']) || request.ip;

export function registerTrafficMetrics(fastify: FastifyInstance, allowedCidrs: string | undefined): void {
    const allowList = metricsAllowList(allowedCidrs);
    const clients = new ClientTrafficTracker();
    const activePollers = new RollingDistinct();
    const alertViewers = new RollingDistinct();

    const requests = new Counter({name: 'ps2alerts_api_http_requests_total', help: 'Requests by route pattern', labelNames: ['route', 'method', 'status_class']});
    const bytes = new Counter({name: 'ps2alerts_api_http_response_bytes_total', help: 'Response bytes before compression, by route pattern', labelNames: ['route']});
    const duration = new Histogram({
        name: 'ps2alerts_api_http_request_duration_seconds',
        help: 'Response time by route pattern',
        labelNames: ['route'],
        buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 30],
    });

    gauge({
        name: 'ps2alerts_api_active_users',
        help: 'Distinct clients polling the active alerts list in the last 5 minutes',
        collect(): void {
            this.set(activePollers.counts().get(ACTIVE_POLL_ROUTE) ?? 0);
        },
    });
    gauge({
        name: 'ps2alerts_api_alert_viewers',
        help: 'Distinct clients viewing each alert in the last 5 minutes, top 20',
        labelNames: ['instance'],
        collect(): void {
            this.reset();
            [...alertViewers.counts().entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20)
                .forEach(([instance, n]) => this.set({instance}, n));
        },
    });

    const snapshot = (): ReturnType<ClientTrafficTracker['snapshot']> => clients.snapshot();
    gauge({
        name: 'ps2alerts_api_client_requests',
        help: 'Requests in the last 5 minutes, top 10 clients',
        labelNames: ['client', 'country', 'user_agent'],
        collect(): void {
            this.reset();
            snapshot().top.forEach((c) => this.set({client: c.client, country: c.country, user_agent: c.userAgent}, c.requests));
        },
    });
    gauge({
        name: 'ps2alerts_api_client_bytes',
        help: 'Response bytes in the last 5 minutes, top 10 clients',
        labelNames: ['client'],
        collect(): void {
            this.reset();
            snapshot().top.forEach((c) => this.set({client: c.client}, c.bytes));
        },
    });
    gauge({
        name: 'ps2alerts_api_window_clients',
        help: 'Distinct clients in the last 5 minutes',
        collect(): void {
            this.set(snapshot().totals.clients);
        },
    });
    gauge({
        name: 'ps2alerts_api_window_overflow_requests',
        help: 'Requests in the last 5 minutes not attributed to a client because the cap was reached',
        collect(): void {
            this.set(snapshot().totals.overflowRequests);
        },
    });

    // Fastify's reply timer only runs with a logger or onResponse hook, and production has neither.
    const started = new WeakMap<FastifyRequest, bigint>();

    fastify.addHook('onRequest', (request, reply, done) => {
        started.set(request, process.hrtime.bigint());

        if (request.routerPath === '/metrics' && !isMetricsRequestAllowed(allowList, request.ip, request.headers)) {
            void reply.code(403).send({error: 'Forbidden'});
            return;
        }

        done();
    });

    fastify.addHook('onSend', (request, reply, payload, done) => {
        const route = request.routerPath ?? 'unmatched';

        if (UNTRACKED_ROUTES.has(route)) {
            done(null, payload);
            return;
        }

        // A stream has no known length and counts as 0.
        const size = typeof payload === 'string' || Buffer.isBuffer(payload) ? payload.length : 0;
        const client = clientOf(request);
        const start = started.get(request);
        const seconds = start === undefined ? 0 : Number(process.hrtime.bigint() - start) / 1e9;

        requests.inc({route, method: request.method, status_class: `${Math.floor(reply.statusCode / 100)}xx`});
        bytes.inc({route}, size);
        duration.observe({route}, seconds);
        clients.record({
            client,
            bytes: size,
            durationMs: seconds * 1000,
            userAgent: header(request.headers['user-agent']),
            country: header(request.headers['cf-ipcountry']),
            route,
        });

        if (route === ACTIVE_POLL_ROUTE) {
            activePollers.add(ACTIVE_POLL_ROUTE, client);
        }

        const instance = (request.params as Record<string, string> | undefined)?.instance;

        if (instance && ALERT_ROUTE_PREFIXES.some((p) => route.startsWith(p))) {
            alertViewers.add(instance, client);
        }

        done(null, payload);
    });
}
