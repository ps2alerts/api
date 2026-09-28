# Aggregate drift audit

Rebuilds every global aggregate from the per-alert aggregates and compares the result with what is stored, field by field. The per-alert rows are the source of truth; the globals are running totals that drift when alerts are deleted, messages are dropped, or a handler writes the wrong key.

Run it against a copy of the database, never production: the character and per-player vehicle collections are tens of millions of rows each. It only reads the aggregate collections and writes `audit_*` collections beside them.

```sh
# Against a local Docker copy
MONGO_CONTAINER=ps2alerts-mongo MONGO_PASS=<password> ./run.sh report.md

# Against any Mongo you can reach
MONGO_URI='mongodb://<user>:<password>@<host>:27017/?authSource=admin' ./run.sh report.md

# Only some collections, and the moment the copy was taken
AUDIT_ONLY=weapons,loadouts AUDIT_CUTOFF=2026-09-28T15:13:00Z MONGO_CONTAINER=ps2alerts-mongo MONGO_PASS=<password> ./run.sh report.md
```

`AUDIT_ONLY` takes any of `victories`, `loadouts`, `weapons`, `vehicles`, `facility_controls`, `faction_combats`, `outfits`, `vehicles_characters`, `characters`.

Set `AUDIT_CUTOFF` to when the copy was taken, less 92 minutes. Bracket rows reach the globals through a delay queue after an alert ends, so an alert that ended inside that window is counted as unsettled rather than drift. Without it the cutoff is 92 minutes before the run.

## How it counts

- Only live metagame data is compared (`ps2AlertsEventType` 1). Outfit Wars rows are left out on both sides.
- Each alert feeds its TOTAL row, and its own bracket row once it has ended, as the aggregator does.
- Server, bracket and event type come from the alert record, not the per-alert row.
- Per-alert vehicle rows can exist twice for one alert, one tagged with an event type and one not. The larger value of each counter across the pair is used.
- Every difference is then explained where it can be:
  - **Unsettled:** the alert was still running, or ended after the cutoff.
  - **Deleted:** per-alert rows whose alert record no longer exists. The stored TOTAL still counts them.
  - **Drift:** whatever is left after those two.
- Faction combats are compared per server and bracket; the stored per-day split is not audited.
- The vehicle kill matrices are not audited yet.
