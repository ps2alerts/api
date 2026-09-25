#!/usr/bin/env python3
"""Generates the PS2Alerts Grafana dashboard (schema v2, Grafana 13).

A generator rather than hand-authored JSON so panel shapes stay consistent.
Every query is pinned to a ps2alerts-* job, since the central Prometheus scrapes other projects too.
"""
import json

NAME = "ps2alerts-overview"
DS = {"name": "prometheus"}
VERSION = "13.2.2"

API = 'job="ps2alerts-api"'
AGG = 'job="ps2alerts-aggregator"'
RMQ = 'job="ps2alerts-rabbitmq"'
MONGO = 'job="ps2alerts-mongodb"'
NODE = 'job="ps2alerts-node"'
CADV = 'job="ps2alerts-cadvisor",name!=""'
RI = "$__rate_interval"


def query(expr, legend="", ref="A", instant=False, table=False):
    spec = {"editorMode": "code", "expr": expr, "legendFormat": legend}
    if instant:
        spec.update({"instant": True, "range": False})
    else:
        spec["range"] = True
    if table:
        spec["format"] = "table"
    return {
        "kind": "PanelQuery",
        "spec": {
            "query": {"kind": "DataQuery", "group": "prometheus", "version": "v0", "datasource": DS, "spec": spec},
            "refId": ref,
            "hidden": False,
        },
    }


def panel(pid, title, description, queries, viz, transformations=None):
    return {
        "kind": "Panel",
        "spec": {
            "id": pid,
            "title": title,
            "description": description,
            "links": [],
            "data": {"kind": "QueryGroup", "spec": {"queries": queries, "transformations": transformations or [], "queryOptions": {}}},
            "vizConfig": viz,
        },
    }


def stat(steps, unit="short", graph="none", color_mode="background", decimals=None):
    defaults = {"unit": unit, "thresholds": {"mode": "absolute", "steps": steps}, "color": {"mode": "thresholds"}}
    if decimals is not None:
        defaults["decimals"] = decimals
    return {
        "kind": "VizConfig",
        "group": "stat",
        "version": VERSION,
        "spec": {
            "options": {
                "colorMode": color_mode, "graphMode": graph, "justifyMode": "auto", "orientation": "auto",
                "percentChangeColorMode": "standard",
                "reduceOptions": {"calcs": ["lastNotNull"], "fields": "", "values": False},
                "showPercentChange": False, "textMode": "auto", "wideLayout": True,
            },
            "fieldConfig": {"defaults": defaults, "overrides": []},
        },
    }


def timeseries(unit="short", fill=10, stack="none", minmax=None, decimals=None, overrides=None, gradient="opacity"):
    defaults = {
        "unit": unit,
        "thresholds": {"mode": "absolute", "steps": [{"value": 0, "color": "green"}]},
        "color": {"mode": "palette-classic"},
        "custom": {
            "axisBorderShow": False, "axisCenteredZero": False, "axisColorMode": "text", "axisLabel": "",
            "axisPlacement": "auto", "barAlignment": 0, "barWidthFactor": 0.6, "drawStyle": "line",
            "fillOpacity": fill, "gradientMode": gradient,
            "hideFrom": {"legend": False, "tooltip": False, "viz": False},
            "insertNulls": False, "lineInterpolation": "linear", "lineWidth": 2, "pointSize": 5,
            "scaleDistribution": {"type": "linear"}, "showPoints": "never", "showValues": False,
            "spanNulls": False, "stacking": {"group": "A", "mode": stack}, "thresholdsStyle": {"mode": "off"},
        },
    }
    if minmax:
        defaults["min"], defaults["max"] = minmax
    if decimals is not None:
        defaults["decimals"] = decimals
    return {
        "kind": "VizConfig",
        "group": "timeseries",
        "version": VERSION,
        "spec": {
            "options": {
                "annotations": {"clustering": -1, "multiLane": False},
                "legend": {"calcs": [], "displayMode": "list", "placement": "bottom", "showLegend": True},
                "tooltip": {"hideZeros": True, "mode": "multi", "sort": "desc"},
            },
            "fieldConfig": {"defaults": defaults, "overrides": overrides or []},
        },
    }


def bargauge(unit="short"):
    return {
        "kind": "VizConfig",
        "group": "bargauge",
        "version": VERSION,
        "spec": {
            "options": {
                "displayMode": "gradient",
                "legend": {"calcs": [], "displayMode": "list", "placement": "bottom", "showLegend": False},
                "maxVizHeight": 300, "minVizHeight": 16, "minVizWidth": 0, "namePlacement": "left",
                "orientation": "horizontal",
                "reduceOptions": {"calcs": ["lastNotNull"], "fields": "", "values": False},
                "showUnfilled": True, "sizing": "auto", "valueMode": "color",
            },
            "fieldConfig": {"defaults": {
                "unit": unit, "color": {"mode": "palette-classic"},
                "thresholds": {"mode": "absolute", "steps": [{"value": 0, "color": "green"}]},
            }, "overrides": []},
        },
    }


def table():
    return {
        "kind": "VizConfig",
        "group": "table",
        "version": VERSION,
        "spec": {
            "options": {"cellHeight": "sm", "showHeader": True, "footer": {"show": False, "reducer": ["sum"], "fields": ""}},
            "fieldConfig": {"defaults": {"custom": {"align": "auto", "cellOptions": {"type": "auto"}}}, "overrides": []},
        },
    }


def hide_columns(*names):
    return [{"kind": "organize", "spec": {"id": "organize", "options": {"excludeByName": {n: True for n in names}}}}]


# Stack order is draw order: small types first, GainExperience last so the biggest band sits on top.
EVENT_ORDER = [("MetagameEvent", "orange"), ("FacilityControl", "yellow"), ("VehicleDestroy", "red"),
               ("Death", "green"), ("GainExperience", "blue")]


def event_colours():
    return [{"matcher": {"id": "byName", "options": name},
             "properties": [{"id": "color", "value": {"mode": "fixed", "fixedColor": colour}}]}
            for name, colour in EVENT_ORDER]


def event_queries(expr_for):
    return [query(expr_for(name), name, chr(65 + i)) for i, (name, _) in enumerate(EVENT_ORDER)]


BLUE = [{"value": 0, "color": "blue"}]
elements = {}


def add(pid, *args, **kwargs):
    elements["panel-%d" % pid] = panel(pid, *args, **kwargs)


# ---------------------------------------------------------------- traffic
add(1, "Requests / s",
    "Every API request that reached the origin, excluding /metrics and /healthcheck.",
    [query('sum(rate(ps2alerts_api_http_requests_total{%s}[5m]))' % API)],
    stat(BLUE, unit="reqps", graph="area", decimals=1))
add(2, "Clients (5 min)",
    "Distinct client IPs seen in the last five minutes. Cloudflare's CF-Connecting-IP, so a NAT counts once.",
    [query('ps2alerts_api_window_clients{%s}' % API)],
    stat(BLUE, graph="area"))
add(3, "Server errors / s",
    "5xx responses. Expect zero.",
    [query('sum(rate(ps2alerts_api_http_requests_total{%s,status_class="5xx"}[5m])) or vector(0)' % API)],
    stat([{"value": 0, "color": "green"}, {"value": 0.05, "color": "#EAB839"}, {"value": 0.5, "color": "red"}], unit="reqps", decimals=2))
add(4, "Bandwidth out",
    "Response bytes before compression, so an upper bound on what crossed the tunnel.",
    [query('sum(rate(ps2alerts_api_http_response_bytes_total{%s}[5m]))' % API)],
    stat(BLUE, unit="Bps", graph="area"))
add(5, "Requests by endpoint",
    "Top 12 route patterns by request rate.",
    [query('topk(12, sum by (route) (rate(ps2alerts_api_http_requests_total{%s}[%s])))' % (API, RI), "{{route}}")],
    timeseries(unit="reqps", stack="normal", fill=20))
add(6, "p95 response time by endpoint",
    "Slow routes are usually unpaginated Mongo reads.",
    [query('histogram_quantile(0.95, sum by (le, route) (rate(ps2alerts_api_http_request_duration_seconds_bucket{%s}[%s])))' % (API, RI), "{{route}}")],
    timeseries(unit="s", fill=0))
add(7, "Bandwidth by endpoint",
    "Which routes send the most data.",
    [query('topk(8, sum by (route) (rate(ps2alerts_api_http_response_bytes_total{%s}[%s])))' % (API, RI), "{{route}}")],
    timeseries(unit="Bps", stack="normal", fill=20))
add(8, "Heaviest clients (last 5 min)",
    "The ten busiest clients right now. This is what the heavy-client alert reads.",
    [query('sort_desc(ps2alerts_api_client_requests{%s})' % API, instant=True, table=True)],
    table(), hide_columns("Time", "__name__", "app", "instance", "job"))
add(9, "Busiest client, busiest minute",
    "The most requests any single client made in one 60-second span, looking back five minutes. The heavy-client alert fires above 200.",
    [query('max(ps2alerts_api_client_peak_requests_per_minute{%s})' % API, "busiest minute"),
     query('vector(200)', "alert threshold", "B")],
    timeseries(unit="short", fill=0))

# ---------------------------------------------------------------- visitors and alerts
add(20, "Active users",
    "Distinct clients polling /instances/active in the last five minutes: anyone with the site open.",
    [query('ps2alerts_api_active_users{%s}' % API)],
    stat(BLUE, graph="area"))
add(21, "Alerts running",
    "Metagame alerts in progress according to the database.",
    [query('ps2alerts_alerts_active{%s}' % API)],
    stat([{"value": 0, "color": "#6a6a6a"}, {"value": 1, "color": "green"}]))
add(22, "Hours since last alert",
    "Since the newest recorded alert started. The host healthcheck pages at 12h.",
    [query('(time() - ps2alerts_last_alert_started_timestamp_seconds{%s}) / 3600' % API)],
    stat([{"value": 0, "color": "green"}, {"value": 6, "color": "#EAB839"}, {"value": 12, "color": "red"}], unit="h", decimals=1))
add(26, "Liveness data age",
    "Minutes since the two alert gauges beside this last refreshed. They refresh every 5 minutes; anything older means the Mongo query is failing and those figures are stale.",
    [query('(time() - ps2alerts_alerts_liveness_refreshed_timestamp_seconds{%s}) / 60' % API)],
    stat([{"value": 0, "color": "green"}, {"value": 11, "color": "#EAB839"}, {"value": 20, "color": "red"}], unit="m", decimals=0))
add(23, "Active users over time", "",
    [query('ps2alerts_api_active_users{%s}' % API, "active users")],
    timeseries())
add(24, "Most viewed alerts (5 min)",
    "Distinct viewers per alert across its page and aggregate endpoints. The alert ID sits in exported_instance because Prometheus reserves instance for the scrape target.",
    [query('topk(15, ps2alerts_api_alert_viewers{%s})' % API, "{{exported_instance}}", instant=True)],
    bargauge())
add(25, "Alerts tracked by aggregators",
    "The aggregators' own view of alert instances, by platform.",
    [query('sum by (platform, type) (aggregator_instances_gauge{%s})' % AGG, "{{platform}} {{type}}")],
    timeseries())

# ---------------------------------------------------------------- queues
add(30, "Messages waiting",
    "Every queued message across RabbitMQ.",
    [query('sum(rabbitmq_queue_messages{%s})' % RMQ)],
    stat(BLUE, graph="area"))
add(31, "Delay queues",
    "Alert results held until the 46- and 91-minute timers fire, then dead-lettered onto api-queue-production. A large 91-minute backlog is normal.",
    [query('sum by (queue) (rabbitmq_queue_messages{%s,queue=~".*delay.*"})' % RMQ, "{{queue}}")],
    timeseries())
add(32, "API queue",
    "api-queue-production, drained by api-aggregator. Ready should stay near zero.",
    [query('sum(rabbitmq_queue_messages_ready{%s,queue="api-queue-production"})' % RMQ, "ready"),
     query('sum(rabbitmq_queue_messages_unacked{%s,queue="api-queue-production"})' % RMQ, "unacked", "B")],
    timeseries())
add(33, "Aggregator queues",
    "Messages waiting in the aggregators' queues: the per-world MetagameEvent queues and each running alert's event queues.",
    [query('sum by (queue) (rabbitmq_queue_messages{%s,queue=~"aggregator-.*"})' % RMQ, "{{queue}}")],
    timeseries())
add(34, "Broker throughput",
    "Messages entering, delivered and acknowledged per second.",
    [query('sum(rate(rabbitmq_global_messages_received_total{%s}[%s]))' % (RMQ, RI), "received"),
     query('sum(rate(rabbitmq_global_messages_delivered_total{%s}[%s]))' % (RMQ, RI), "delivered", "B"),
     query('sum(rate(rabbitmq_global_messages_acknowledged_total{%s}[%s]))' % (RMQ, RI), "acknowledged", "C")],
    timeseries(unit="short"))
add(35, "Queues without consumers",
    "Queues holding messages with nobody reading them, excluding the delay queues, which never have consumers.",
    [query('count((rabbitmq_queue_consumers{%s,queue!~".*delay.*"} == 0) and (rabbitmq_queue_messages{%s} > 0)) or vector(0)' % (RMQ, RMQ))],
    stat([{"value": 0, "color": "green"}, {"value": 1, "color": "red"}]))
add(36, "RabbitMQ memory",
    "Resident memory against the high watermark, above which RabbitMQ blocks publishers.",
    [query('sum(rabbitmq_process_resident_memory_bytes{%s})' % RMQ, "resident"),
     query('sum(rabbitmq_resident_memory_limit_bytes{%s})' % RMQ, "high watermark", "B")],
    timeseries(unit="bytes"))
add(37, "Messages received by type",
    "Census events published into the aggregators' queues per second, stacked by type with the largest on top. Per-alert queues only exist while an alert runs.",
    event_queries(lambda e: 'sum(rate(rabbitmq_queue_messages_published_total{%s,queue=~"aggregator-(?:[0-9]+-)+%s"}[%s])) or vector(0)' % (RMQ, e, RI)),
    timeseries(unit="short", stack="normal", fill=70, gradient="none", overrides=event_colours()))
add(38, "Messages processed by type",
    "What the aggregators successfully processed per second across all platforms, stacked by type with the largest on top.",
    event_queries(lambda e: 'sum(rate(aggregator_queue_messages_count{%s,type="success",event_type="%s"}[%s])) or vector(0)' % (AGG, e, RI)),
    timeseries(unit="short", stack="normal", fill=70, gradient="none", overrides=event_colours()))

# ---------------------------------------------------------------- datastores
add(40, "Mongo operations / s", "",
    [query('sum by (legacy_op_type) (rate(mongodb_ss_opcounters{%s}[%s]))' % (MONGO, RI), "{{legacy_op_type}}")],
    timeseries(unit="ops", stack="normal", fill=20))
add(41, "Mongo latency by op type", "Average per operation.",
    [query('sum by (op_type) (rate(mongodb_ss_opLatencies_latency{%s}[%s])) / sum by (op_type) (rate(mongodb_ss_opLatencies_ops{%s}[%s]))' % (MONGO, RI, MONGO, RI), "{{op_type}}")],
    timeseries(unit="µs", fill=0))
add(42, "Busiest collections", "Time Mongo spent per collection, per second.",
    [query('topk(10, sum by (collection) (rate(mongodb_top_total_time{%s}[%s])))' % (MONGO, RI), "{{collection}}")],
    timeseries(unit="µs", stack="normal", fill=20))
add(43, "Mongo connections", "",
    [query('mongodb_ss_connections{%s,conn_type="current"}' % MONGO, "current"),
     query('mongodb_ss_connections{%s,conn_type="active"}' % MONGO, "active", "B")],
    timeseries())
add(44, "WiredTiger cache used", "Cache fill against its configured maximum.",
    [query('mongodb_ss_wt_cache_bytes_currently_in_the_cache{%s} / mongodb_ss_wt_cache_maximum_bytes_configured{%s}' % (MONGO, MONGO))],
    stat([{"value": 0, "color": "green"}, {"value": 0.8, "color": "#EAB839"}, {"value": 0.95, "color": "red"}], unit="percentunit", graph="area"))
add(45, "Aggregator Redis keys", "Cached entities held by the aggregators.",
    [query('sum by (type) (aggregator_cache_keys_gauge{%s})' % AGG, "{{type}}")],
    timeseries())

# ---------------------------------------------------------------- system health
add(50, "Host CPU", "By mode, across both cores.",
    [query('sum by (mode) (rate(node_cpu_seconds_total{%s,mode!="idle"}[%s])) / scalar(count(count by (cpu) (node_cpu_seconds_total{%s})))' % (NODE, RI, NODE), "{{mode}}")],
    timeseries(unit="percentunit", stack="normal", fill=30, minmax=(0, 1)))
add(51, "Load", "",
    [query('node_load1{%s}' % NODE, "1m"), query('node_load5{%s}' % NODE, "5m", "B")],
    timeseries(fill=0))
add(52, "Memory available", "",
    [query('node_memory_MemAvailable_bytes{%s} / node_memory_MemTotal_bytes{%s}' % (NODE, NODE))],
    stat([{"value": 0, "color": "red"}, {"value": 0.1, "color": "#EAB839"}, {"value": 0.25, "color": "green"}], unit="percentunit", graph="area"))
add(53, "IO pressure", "Share of time some task was stalled on IO (PSI). The backup stalls show here.",
    [query('rate(node_pressure_io_waiting_seconds_total{%s}[%s])' % (NODE, RI), "io waiting")],
    timeseries(unit="percentunit", fill=20))
add(54, "CPU by container", "",
    [query('topk(8, sum by (name) (rate(container_cpu_usage_seconds_total{%s}[%s])))' % (CADV, RI), "{{name}}")],
    timeseries(unit="short", stack="normal", fill=20))
add(55, "Memory by container", "Working set.",
    [query('topk(8, sum by (name) (container_memory_working_set_bytes{%s}))' % CADV, "{{name}}")],
    timeseries(unit="bytes", stack="normal", fill=20))
add(56, "Disk writes by container", "What the hourly backups pay for.",
    [query('topk(6, sum by (name) (rate(container_blkio_device_usage_total{%s,operation="Write"}[%s])))' % (CADV, RI), "{{name}}")],
    timeseries(unit="Bps", stack="normal", fill=20))
add(57, "Network (ens18)", "",
    [query('rate(node_network_transmit_bytes_total{%s,device="ens18"}[%s]) * 8' % (NODE, RI), "out"),
     query('rate(node_network_receive_bytes_total{%s,device="ens18"}[%s]) * 8' % (NODE, RI), "in", "B")],
    timeseries(unit="bps"))
add(58, "Scrape targets up", "Every PS2Alerts endpoint Prometheus reads. Anything below 1 is down or refusing the scrape.",
    [query('up{job=~"ps2alerts-.*"}', "{{job}} {{platform}}", instant=True)],
    bargauge())

# ---------------------------------------------------------------- aggregators
add(60, "Messages by world", "Census events processed per world.",
    [query('sum by (world) (rate(aggregator_zone_message_count{%s}[%s]))' % (AGG, RI), "{{world}}")],
    timeseries(unit="short", stack="normal", fill=20))
add(61, "Event processing p95", "",
    [query('histogram_quantile(0.95, sum by (le, eventType) (rate(aggregator_event_processing_histogram_bucket{%s}[%s])))' % (AGG, RI), "{{eventType}}")],
    timeseries(unit="ms", fill=0))
add(62, "Failed or unmatched messages", "",
    [query('sum by (type, event_type) (rate(aggregator_queue_messages_count{%s,type!="success"}[%s]))' % (AGG, RI), "{{type}} {{event_type}}")],
    timeseries())
add(63, "Cache hit rate", "",
    [query('sum by (type) (rate(aggregator_cache_hitmiss_count{%s,result="cache_hit"}[%s])) / sum by (type) (rate(aggregator_cache_hitmiss_count{%s}[%s]))' % (AGG, RI, AGG, RI), "{{type}}")],
    timeseries(unit="percentunit", fill=0, minmax=(0, 1)))
add(64, "External requests", "Census and PS2Alerts API calls made by the aggregators.",
    [query('sum by (provider, endpoint) (rate(aggregator_external_requests_count{%s}[%s]))' % (AGG, RI), "{{provider}} {{endpoint}}")],
    timeseries())
add(65, "External request errors", "",
    [query('sum by (provider, result) (rate(aggregator_external_requests_count{%s,result=~"error|retry|empty"}[%s]))' % (AGG, RI), "{{provider}} {{result}}")],
    timeseries())
add(66, "Unknown facilities / items", "Census IDs the aggregators could not resolve.",
    [query('sum by (type) (aggregator_cache_keys_gauge{%s,type=~"unknown_facilities|unknown_items"})' % AGG, "{{type}}")],
    timeseries())


def item(x, y, w, h, pid):
    return {"kind": "GridLayoutItem", "spec": {"x": x, "y": y, "width": w, "height": h,
                                                 "element": {"kind": "ElementReference", "name": "panel-%d" % pid}}}


def row(title, items, collapse=False):
    return {"kind": "RowsLayoutRow", "spec": {"title": title, "collapse": collapse,
                                               "layout": {"kind": "GridLayout", "spec": {"items": items}}}}


rows = [
    row("🌐 Traffic", [
        item(0, 0, 6, 4, 1), item(6, 0, 6, 4, 2), item(12, 0, 6, 4, 3), item(18, 0, 6, 4, 4),
        item(0, 4, 12, 8, 5), item(12, 4, 12, 8, 6),
        item(0, 12, 12, 8, 7), item(12, 12, 12, 8, 9),
        item(0, 20, 24, 8, 8),
    ]),
    row("👥 Visitors & Alerts", [
        item(0, 0, 6, 4, 20), item(6, 0, 6, 4, 21), item(12, 0, 6, 4, 22), item(18, 0, 6, 4, 26),
        item(0, 4, 12, 9, 23), item(12, 4, 12, 9, 24),
        item(0, 13, 24, 7, 25),
    ]),
    row("📬 Queues", [
        item(0, 0, 12, 4, 30), item(12, 0, 12, 4, 35),
        item(0, 4, 12, 8, 31), item(12, 4, 12, 8, 32),
        item(0, 12, 12, 8, 33), item(12, 12, 12, 8, 34),
        item(0, 20, 12, 9, 37), item(12, 20, 12, 9, 38),
        item(0, 29, 24, 9, 36),
    ]),
    row("🗄️ Datastores", [
        item(0, 0, 12, 8, 40), item(12, 0, 12, 8, 41),
        item(0, 8, 12, 8, 42), item(12, 8, 6, 8, 43), item(18, 8, 6, 4, 44),
        item(18, 12, 6, 4, 45),
    ]),
    row("🖥️ System Health", [
        item(0, 0, 12, 8, 50), item(12, 0, 6, 8, 51), item(18, 0, 6, 4, 52), item(18, 4, 6, 4, 53),
        item(0, 8, 12, 8, 54), item(12, 8, 12, 8, 55),
        item(0, 16, 12, 8, 56), item(12, 16, 6, 8, 57), item(18, 16, 6, 8, 58),
    ]),
    row("⚙️ Aggregators", [
        item(0, 0, 12, 8, 60), item(12, 0, 12, 8, 61),
        item(0, 8, 12, 8, 62), item(12, 8, 12, 8, 63),
        item(0, 16, 12, 8, 64), item(12, 16, 6, 8, 65), item(18, 16, 6, 8, 66),
    ], collapse=True),
]

dashboard = {
    "apiVersion": "dashboard.grafana.app/v2",
    "kind": "Dashboard",
    "metadata": {"name": NAME, "namespace": "default"},
    "spec": {
        "annotations": [{
            "kind": "AnnotationQuery",
            "spec": {
                "query": {"kind": "DataQuery", "group": "grafana", "version": "v0", "datasource": {"name": "-- Grafana --"}, "spec": {}},
                "enable": True, "hide": True, "iconColor": "rgba(0, 211, 255, 1)", "name": "Annotations & Alerts", "builtIn": True,
            },
        }],
        "cursorSync": "Crosshair",
        "description": "PS2Alerts: API traffic and visitors, alert liveness, RabbitMQ, Mongo, host and container health, and the aggregators.",
        "editable": True,
        "elements": elements,
        "layout": {"kind": "RowsLayout", "spec": {"rows": rows}},
        "links": [],
        "liveNow": False,
        "preload": False,
        "tags": ["ps2alerts"],
        "timeSettings": {
            "timezone": "browser", "from": "now-6h", "to": "now", "autoRefresh": "1m",
            "autoRefreshIntervals": ["30s", "1m", "5m", "15m", "30m", "1h"],
            "hideTimepicker": False, "fiscalYearStartMonth": 0,
        },
        "title": "PS2Alerts",
        "variables": [],
    },
}

print(json.dumps(dashboard, indent=2, ensure_ascii=False))
