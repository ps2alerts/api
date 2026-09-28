#!/bin/sh
# Runs the aggregate drift audit and writes a markdown report. See README.md.
#   MONGO_CONTAINER=ps2alerts-mongo MONGO_USER=root MONGO_PASS=... ./run.sh report.md
#   MONGO_URI='mongodb://user:pass@host:27017/?authSource=admin' ./run.sh report.md
# Optional: AUDIT_ONLY=weapons,loadouts to limit collections; AUDIT_CUTOFF=<ISO date> for when the copy was taken.
set -eu
out="${1:-aggregate-audit.md}"
here="$(cd "$(dirname "$0")" && pwd)"
vars="var AUDIT_ONLY='${AUDIT_ONLY:-}'; var AUDIT_CUTOFF='${AUDIT_CUTOFF:-}';"

if [ -n "${MONGO_CONTAINER:-}" ]; then
    docker cp "$here/audit.js" "$MONGO_CONTAINER:/tmp/aggregate-audit.js"
    docker exec "$MONGO_CONTAINER" mongosh --quiet -u "${MONGO_USER:-root}" -p "${MONGO_PASS:?set MONGO_PASS}" \
        --authenticationDatabase admin --eval "$vars" /tmp/aggregate-audit.js > "$out"
else
    mongosh --quiet "${MONGO_URI:?set MONGO_URI or MONGO_CONTAINER}" --eval "$vars" "$here/audit.js" > "$out"
fi

echo "Report written to $out"
