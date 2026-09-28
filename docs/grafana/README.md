# Grafana dashboard

`generate.py` is the source of truth for the PS2Alerts dashboard; `ps2alerts.json` is its output.
Every query is pinned to a `ps2alerts-*` job, because the Prometheus it reads scrapes other projects too.

## Regenerating and applying

```sh
python3 generate.py > ps2alerts.json
```

Create with a `POST` of the JSON to `/apis/dashboard.grafana.app/v2/namespaces/default/dashboards`.
Update with a `PUT` to `.../dashboards/ps2alerts-overview`, carrying the current
`metadata.resourceVersion` or the API rejects it as a conflict. Not provisioned from disk, so panels
can still be tweaked in the UI; fold any tweak back into `generate.py` or the next apply undoes it.

## What feeds it

| Job | Source |
| --- | --- |
| `ps2alerts-api` | this repo's `/metrics`, LAN-only (`METRICS_ALLOWED_CIDRS`) |
| `ps2alerts-aggregator` | the aggregators' `/metrics`, same guard |
| `ps2alerts-rabbitmq` | RabbitMQ's `rabbitmq_prometheus` plugin, `/metrics/per-object` |
| `ps2alerts-mongodb` | `percona/mongodb_exporter` |
| `ps2alerts-node` | `node_exporter` |
| `ps2alerts-cadvisor` | cAdvisor |

The heavy-client and metrics-missing alerts are Grafana alert rules in the PS2Alerts folder, not part
of this JSON.
