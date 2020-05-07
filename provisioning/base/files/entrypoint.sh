#!/bin/sh

echo "=============== STARTING SERVICES ==================="
sudo --preserve-env=ENVIRONMENT \
  --preserve-env=VERSION \
  --preserve-env=DB_HOST \
  --preserve-env=DB_USER \
  --preserve-env=DB_PASS \
  --preserve-env=DB_NAME \
  --preserve-env=DB_NAME_DATA \
  --preserve-env=DB_NAME_ARCHIVE \
  --preserve-env=REDIS_ENABLED \
  --preserve-env=REDIS_HOST \
  --preserve-env=REDIS_PORT \
  --preserve-env=REDIS_PASS \
  --preserve-env=REDIS_DB \
  --preserve-env=BASE_URL \
  --preserve-env=CENSUS_SERVICE_ID \
  -u root runsvdir -P /etc/service