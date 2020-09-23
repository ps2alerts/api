#!/bin/sh

echo "=============== STARTING SERVICES ==================="
sudo --preserve-env=NODE_ENV \
  --preserve-env=VERSION \
  --preserve-env=BASE_URL \
  --preserve-env=DB_HOST \
  --preserve-env=DB_PORT \
  --preserve-env=DB_USER \
  --preserve-env=DB_PASS \
  --preserve-env=DB_NAME \
  --preserve-env=DB_DEBUG \
  --preserve-env=CENSUS_SERVICE_ID \
  -u root runsvdir -P /etc/service