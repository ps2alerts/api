FROM ps2alerts/api:base

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        watch \
    && rm -rf /var/lib/apt/lists/* /var/cache/apk/*

USER node