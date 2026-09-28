/* global db, print, printjson, AUDIT_ONLY, AUDIT_CUTOFF */
// Rebuilds every global aggregate from the per-alert aggregates and reports how far the stored globals have drifted.
// Run with mongosh against a copy of the database; see README.md. It only writes `audit_*` collections.

const DB = db.getSiblingDB('ps2alerts');
const ONLY = typeof AUDIT_ONLY === 'string' && AUDIT_ONLY ? AUDIT_ONLY.split(',') : null;
// Alerts ending after this may not have reached every global yet (bracket rows wait out a 91 minute delay queue)
const CUTOFF = typeof AUDIT_CUTOFF === 'string' && AUDIT_CUTOFF ? new Date(AUDIT_CUTOFF) : new Date(Date.now() - 92 * 60 * 1000);
const ENDED = 2;
const LIVE = 1;
const TOTAL = 0;
const OPTS = {allowDiskUse: true};

const FACTIONS = ['vs', 'nc', 'tr', 'nso', 'none'];
const FACTION_KILLS = FACTIONS.flatMap((a) => FACTIONS.map((b) => `factionKills.${a}.${b}`));
const COMBAT = ['kills', 'deaths', 'teamKills', 'teamKilled', 'suicides', 'headshots'];
const VEHICLE = ['vehicles.kills', 'vehicles.deaths', 'vehicles.teamkills', 'vehicles.teamkilled',
    'infantry.kills', 'infantry.deaths', 'infantry.teamkills', 'infantry.teamkilled', 'suicides', 'roadkills'];
const FACILITY = [...FACTIONS.flatMap((f) => [`${f}.captures`, `${f}.defences`,
    ...FACTIONS.map((o) => `${f}.lostTo.${o}`), ...FACTIONS.map((o) => `${f}.takenFrom.${o}`)]),
'totals.captures', 'totals.defences'];
const FACTION_COMBAT = [...[...FACTIONS, 'totals'].flatMap((f) => ['kills', 'deaths', 'headshots', 'suicides', 'teamKills'].map((s) => `${f}.${s}`)),
    ...FACTION_KILLS];

// key: fields identifying a row besides world and bracket, as [name, per-alert path, global path]
const SPECS = [
    {name: 'loadouts', source: 'aggregate_instance_loadouts', global: 'aggregate_global_loadouts',
        key: [['loadout', '$loadout', '$loadout']], fields: [...COMBAT, ...FACTION_KILLS]},
    {name: 'weapons', source: 'aggregate_instance_weapons', global: 'aggregate_global_weapons',
        key: [['weapon', '$weapon.id', '$weapon.id']], fields: ['kills', 'teamKills', 'suicides', 'headshots', ...FACTION_KILLS]},
    {name: 'vehicles', source: 'aggregate_instance_vehicles', global: 'aggregate_global_vehicles',
        key: [['vehicle', '$vehicle', '$vehicle']], fields: VEHICLE, mergeTwins: ['vehicle']},
    {name: 'facility_controls', source: 'aggregate_instance_facility_controls', global: 'aggregate_global_facility_controls',
        key: [['facility', '$facility.id', '$facility.id']], fields: FACILITY},
    {name: 'faction_combats', source: 'aggregate_instance_faction_combats', global: 'aggregate_global_faction_combats',
        key: [], fields: FACTION_COMBAT, note: 'Compared per world and bracket; the stored per-day split is not audited.'},
    {name: 'outfits', source: 'aggregate_instance_outfits', global: 'aggregate_global_outfits',
        key: [['outfit', '$outfit.id', '$outfit.id']], fields: [...COMBAT, 'captures', ...FACTION_KILLS]},
    {name: 'vehicles_characters', source: 'aggregate_instance_vehicles_characters', global: 'aggregate_global_vehicles_characters',
        key: [['vehicle', '$vehicle', '$vehicle'], ['character', '$character', '$character']], fields: VEHICLE, mergeTwins: ['vehicle', 'character']},
    {name: 'characters', source: 'aggregate_instance_characters', global: 'aggregate_global_characters',
        key: [['character', '$character.id', '$character.id']], fields: [...COMBAT, ...FACTION_KILLS]},
];

const num = (path) => ({$ifNull: [`$${path}`, 0]});
const fieldId = (i) => `f${i}`;
const idOf = (world, spec, which, bracket) => {
    const id = {world};
    spec.key.forEach(([name, source, global]) => {
        id[name] = which === 'source' ? source : global;
    });
    id.bracket = bracket;
    return id;
};

// One row per alert: which rows it feeds, and whether it is settled enough to compare
function buildAlerts() {
    DB.audit_alerts.drop();
    DB.instance_metagame_territories.aggregate([
        {$match: {world: {$ne: null}, timeStarted: {$ne: null}, state: {$in: [1, ENDED]}}},
        {$project: {
            _id: '$instanceId',
            world: 1,
            zone: 1,
            bracket: 1,
            state: 1,
            timeEnded: 1,
            result: 1,
            et: {$ifNull: ['$ps2AlertsEventType', LIVE]},
            settled: {$and: [{$eq: ['$state', ENDED]}, {$lt: ['$timeEnded', CUTOFF]}]},
        }},
        // Outfit Wars matches are their own event type; listing them keeps their rows out of the live totals
        {$unionWith: {coll: 'instance_outfitwars_2022', pipeline: [
            {$project: {_id: '$instanceId', world: 1, state: 1, et: {$ifNull: ['$ps2AlertsEventType', 2]}, settled: {$literal: true}}},
        ]}},
        {$out: 'audit_alerts'},
    ], OPTS);
    print(`Live alerts: ${DB.audit_alerts.countDocuments({et: LIVE})}, of which ${DB.audit_alerts.countDocuments({et: LIVE, settled: true})} ended before the cutoff.`);

    // Alert ids count up per world, so an id above the newest on record started after the alert list was copied
    DB.instance_metagame_territories.aggregate([
        {$group: {_id: '$world', max: {$max: '$censusInstanceId'}}},
    ]).forEach((row) => {
        NEWEST[row._id] = row.max;
    });
}

const NEWEST = {};

// Per-alert rows grouped into global keys, split by class: ok (settled live alert), unsettled, orphan (alert deleted)
function rebuild(spec) {
    const out = `audit_rebuilt_${spec.name}`;
    const pipeline = [];

    if (spec.mergeTwins) {
        // Untagged and tagged twins of one per-alert row each hold part of the truth; the larger value of each counter is right
        const group = {_id: {instance: '$instance'}};
        spec.mergeTwins.forEach((k) => {
            group._id[k] = `$${k}`;
        });
        spec.fields.forEach((f, i) => {
            group[fieldId(i)] = {$max: num(f)};
        });
        pipeline.push({$group: group});
        const back = {instance: '$_id.instance'};
        spec.mergeTwins.forEach((k) => {
            back[k] = `$_id.${k}`;
        });
        spec.fields.forEach((f, i) => {
            back[fieldId(i)] = `$${fieldId(i)}`;
        });
        pipeline.push({$project: back});
    } else {
        const project = {instance: 1};
        spec.key.forEach(([, source]) => {
            project[source.slice(1)] = 1;
        });
        spec.fields.forEach((f, i) => {
            project[fieldId(i)] = num(f);
        });
        pipeline.push({$project: project});
    }

    const part = (i) => ({$convert: {input: {$arrayElemAt: [{$split: ['$instance', '-']}, i]}, to: 'int', onError: null, onNull: null}});
    const worldOfId = part(0);
    const censusId = part(1);
    const newestFor = (world) => ({$switch: {
        branches: Object.entries(NEWEST).map(([w, max]) => ({case: {$eq: [world, Number(w)]}, then: max})),
        default: 0,
    }});

    pipeline.push(
        {$lookup: {from: 'audit_alerts', localField: 'instance', foreignField: '_id', as: 'a'}},
        {$set: {a: {$first: '$a'}}},
        {$match: {$or: [{a: null, instance: {$not: /^outfitwars/}}, {'a.et': LIVE}]}},
        {$set: {
            // A failed lookup leaves `a` missing, which an expression does not treat as equal to null
            cls: {$cond: [
                {$eq: [{$ifNull: ['$a', null]}, null]},
                {$cond: [{$or: [{$eq: [censusId, null]}, {$gt: [censusId, newestFor(worldOfId)]}]}, 'late', 'orphan']},
                {$cond: ['$a.settled', 'ok', 'unsettled']},
            ]},
            // Every alert feeds TOTAL; only ended live alerts feed their own bracket. Orphans have no known bracket.
            brackets: {$cond: [
                {$eq: ['$a.state', ENDED]},
                [TOTAL, '$a.bracket'],
                [TOTAL],
            ]},
        }},
        {$unwind: '$brackets'},
        {$match: {cls: {$ne: 'late'}}},
    );

    // A deleted alert has no record, but its id still starts with the world
    const world = {$ifNull: ['$a.world', worldOfId]};
    const group = {_id: {id: idOf(world, spec, 'source', '$brackets'), cls: '$cls'}, rows: {$sum: 1}};
    spec.fields.forEach((f, i) => {
        group[fieldId(i)] = {$sum: `$${fieldId(i)}`};
    });
    pipeline.push({$group: group}, {$out: out});

    DB.getCollection(spec.source).aggregate(pipeline, OPTS);
}

function current(spec) {
    const group = {_id: idOf('$world', spec, 'global', '$bracket'), rows: {$sum: 1}};
    spec.fields.forEach((f, i) => {
        group[fieldId(i)] = {$sum: num(f)};
    });
    DB.getCollection(spec.global).aggregate([
        {$match: {ps2AlertsEventType: LIVE}},
        {$group: group},
        {$out: `audit_current_${spec.name}`},
    ], OPTS);
}

function compare(spec) {
    const sides = (coll, side) => {
        const project = {side: {$literal: side}, id: side === 'current' ? '$_id' : '$_id.id', cls: side === 'current' ? 'current' : '$_id.cls'};
        spec.fields.forEach((f, i) => {
            project[fieldId(i)] = `$${fieldId(i)}`;
        });
        return project;
    };
    const pick = (cls, i) => ({$sum: {$cond: [{$eq: ['$cls', cls]}, `$${fieldId(i)}`, 0]}});
    const group = {_id: '$id', inCurrent: {$max: {$cond: [{$eq: ['$cls', 'current']}, 1, 0]}}, inRebuilt: {$max: {$cond: [{$eq: ['$cls', 'ok']}, 1, 0]}}};
    spec.fields.forEach((f, i) => {
        group[`c${i}`] = pick('current', i);
        group[`r${i}`] = pick('ok', i);
        group[`u${i}`] = pick('unsettled', i);
        group[`o${i}`] = pick('orphan', i);
    });

    DB.getCollection(`audit_current_${spec.name}`).aggregate([
        {$project: sides(null, 'current')},
        {$unionWith: {coll: `audit_rebuilt_${spec.name}`, pipeline: [{$project: sides(null, 'rebuilt')}]}},
        {$group: group},
        {$out: `audit_diff_${spec.name}`},
    ], OPTS);
}

function summarise(spec) {
    const diff = DB.getCollection(`audit_diff_${spec.name}`);
    const main = 0;
    // Stored minus rebuilt, less what running alerts and deleted alerts account for
    const residual = (i) => ({$subtract: [`$c${i}`, {$add: [`$r${i}`, `$u${i}`, `$o${i}`]}]});
    const anyDiff = {$or: spec.fields.map((f, i) => ({$ne: [`$c${i}`, `$r${i}`]}))};
    const anyResidual = {$or: spec.fields.map((f, i) => ({$ne: [residual(i), 0]}))};
    const bracketClass = {$cond: [{$eq: ['$_id.bracket', TOTAL]}, 'TOTAL', 'brackets']};

    const totals = {_id: bracketClass, keys: {$sum: 1},
        onlyCurrent: {$sum: {$cond: [{$and: [{$eq: ['$inCurrent', 1]}, {$eq: ['$inRebuilt', 0]}]}, 1, 0]}},
        onlyRebuilt: {$sum: {$cond: [{$and: [{$eq: ['$inCurrent', 0]}, {$eq: ['$inRebuilt', 1]}]}, 1, 0]}},
        matched: {$sum: {$cond: [anyDiff, 0, 1]}},
        drifted: {$sum: {$cond: [anyResidual, 1, 0]}}};
    spec.fields.forEach((f, i) => {
        totals[`c${i}`] = {$sum: `$c${i}`};
        totals[`r${i}`] = {$sum: `$r${i}`};
        totals[`u${i}`] = {$sum: `$u${i}`};
        totals[`o${i}`] = {$sum: `$o${i}`};
        totals[`d${i}`] = {$sum: {$cond: [{$ne: [residual(i), 0]}, 1, 0]}};
    });
    const byClass = diff.aggregate([{$group: totals}, {$sort: {_id: -1}}], OPTS).toArray();

    const orphans = DB.getCollection(`audit_rebuilt_${spec.name}`).aggregate([
        {$match: {'_id.cls': 'orphan'}},
        {$group: {_id: null, rows: {$sum: '$rows'}, main: {$sum: `$${fieldId(main)}`}}},
    ], OPTS).toArray()[0] ?? {rows: 0, main: 0};

    const worst = diff.aggregate([
        {$set: {res: residual(main)}},
        {$match: {res: {$ne: 0}}},
        {$set: {abs: {$abs: '$res'}}},
        {$sort: {abs: -1}},
        {$limit: 10},
        {$project: {_id: 1, current: `$c${main}`, rebuilt: `$r${main}`, unsettled: `$u${main}`, orphan: `$o${main}`, res: 1}},
    ], OPTS).toArray();

    return {spec, byClass, orphans, worst};
}

const pct = (a, b) => (b === 0 ? (a === 0 ? '0%' : 'new') : `${(((a - b) / b) * 100).toFixed(2)}%`);
const n = (x) => Number(x).toLocaleString('en-GB');

function report({spec, byClass, orphans, worst}, seconds) {
    const lines = [`## ${spec.name}`, '', `Stored \`${spec.global}\` (live metagame rows) against a rebuild from \`${spec.source}\`. ${spec.note ?? ''} Took ${seconds}s.`, ''];
    lines.push('| Rows | Keys | Match exactly | Drift after explained causes | Only stored | Only rebuilt |', '| --- | --- | --- | --- | --- | --- |');
    byClass.forEach((c) => lines.push(`| ${c._id} | ${n(c.keys)} | ${n(c.matched)} | ${n(c.drifted)} | ${n(c.onlyCurrent)} | ${n(c.onlyRebuilt)} |`));
    lines.push('', `Deleted alerts: ${n(orphans.rows)} per-alert rows, ${n(orphans.main)} ${spec.fields[0]}, left out of the rebuild and still counted in the stored TOTAL rows.`, '');
    lines.push('| Field | Rows | Stored | Rebuilt | Unsettled alerts | Deleted alerts | Stored vs rebuilt | Keys drifting |', '| --- | --- | --- | --- | --- | --- | --- | --- |');
    byClass.forEach((c) => spec.fields.forEach((f, i) => {
        if (c[`c${i}`] === 0 && c[`r${i}`] === 0) {
            return;
        }

        lines.push(`| ${f} | ${c._id} | ${n(c[`c${i}`])} | ${n(c[`r${i}`])} | ${n(c[`u${i}`])} | ${n(c[`o${i}`])} | ${pct(c[`c${i}`], c[`r${i}`])} | ${n(c[`d${i}`])} |`);
    }));
    lines.push('', `Worst keys by ${spec.fields[0]} (stored, less rebuilt, unsettled and deleted):`, '', '| Key | Stored | Rebuilt | Unsettled | Deleted | Residual |', '| --- | --- | --- | --- | --- | --- |');
    worst.forEach((w) => lines.push(`| \`${JSON.stringify(w._id)}\` | ${n(w.current)} | ${n(w.rebuilt)} | ${n(w.unsettled)} | ${n(w.orphan)} | ${n(w.res)} |`));
    lines.push('');
    print(lines.join('\n'));
}

function victories() {
    const started = Date.now();
    const winner = {$switch: {branches: [
        {case: {$eq: ['$result.draw', true]}, then: 'draws'},
        {case: {$eq: ['$result.victor', 1]}, then: 'vs'},
        {case: {$eq: ['$result.victor', 2]}, then: 'nc'},
        {case: {$eq: ['$result.victor', 3]}, then: 'tr'},
    ], default: null}};
    DB.audit_alerts.aggregate([
        {$match: {settled: true, et: LIVE}},
        {$set: {w: winner, day: {$dateTrunc: {date: '$timeEnded', unit: 'day', timezone: 'UTC'}}, brackets: [TOTAL, '$bracket']}},
        {$match: {w: {$ne: null}}},
        {$unwind: '$brackets'},
        {$group: {_id: {world: '$world', zone: '$zone', date: '$day', bracket: '$brackets'},
            vs: {$sum: {$cond: [{$eq: ['$w', 'vs']}, 1, 0]}}, nc: {$sum: {$cond: [{$eq: ['$w', 'nc']}, 1, 0]}},
            tr: {$sum: {$cond: [{$eq: ['$w', 'tr']}, 1, 0]}}, draws: {$sum: {$cond: [{$eq: ['$w', 'draws']}, 1, 0]}}}},
        {$out: 'audit_rebuilt_victories'},
    ], OPTS);
    const cmp = DB.aggregate_global_victories.aggregate([
        {$match: {ps2AlertsEventType: LIVE, date: {$lt: CUTOFF}}},
        {$project: {_id: {world: '$world', zone: '$zone', date: '$date', bracket: '$bracket'}, vs: 1, nc: 1, tr: 1, draws: 1, side: 'c'}},
        {$unionWith: {coll: 'audit_rebuilt_victories', pipeline: [{$set: {side: 'r'}}]}},
        {$group: {_id: '$_id', c: {$sum: {$cond: [{$eq: ['$side', 'c']}, {$add: [{$ifNull: ['$vs', 0]}, {$ifNull: ['$nc', 0]}, {$ifNull: ['$tr', 0]}, {$ifNull: ['$draws', 0]}]}, 0]}},
            r: {$sum: {$cond: [{$eq: ['$side', 'r']}, {$add: ['$vs', '$nc', '$tr', '$draws']}, 0]}}}},
        {$group: {_id: {$cond: [{$eq: ['$_id.bracket', TOTAL]}, 'TOTAL', 'brackets']}, keys: {$sum: 1},
            matched: {$sum: {$cond: [{$eq: ['$c', '$r']}, 1, 0]}}, stored: {$sum: '$c'}, rebuilt: {$sum: '$r'}}},
        {$sort: {_id: -1}},
    ], OPTS).toArray();
    const lines = ['## victories', '', `Stored \`aggregate_global_victories\` against a count of ended live alerts by the day they ended. Took ${Math.round((Date.now() - started) / 1000)}s.`, '',
        '| Rows | Keys (world, zone, day) | Match exactly | Stored results | Rebuilt results | Stored vs rebuilt |', '| --- | --- | --- | --- | --- | --- |'];
    cmp.forEach((c) => lines.push(`| ${c._id} | ${n(c.keys)} | ${n(c.matched)} | ${n(c.stored)} | ${n(c.rebuilt)} | ${pct(c.stored, c.rebuilt)} |`));
    print(`${lines.join('\n')}\n`);
}

print(`# Aggregate drift audit\n\nRun ${new Date().toISOString()} against \`${DB.getName()}\`. Alerts that were running, or ended after ${CUTOFF.toISOString()}, count as unsettled.\n`);
buildAlerts();
print('');

if (!ONLY || ONLY.includes('victories')) {
    victories();
}

SPECS.filter((spec) => !ONLY || ONLY.includes(spec.name)).forEach((spec) => {
    const started = Date.now();
    rebuild(spec);
    current(spec);
    compare(spec);
    report(summarise(spec), Math.round((Date.now() - started) / 1000));
});
