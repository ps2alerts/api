FROM maelstromeous/ps2alerts:api-base

USER root
COPY provisioning/production/entrypoint.sh /etc/service/entrypoint.sh

USER node
COPY --chown=node:node . /app
RUN cd /app && yarn install && yarn run build
