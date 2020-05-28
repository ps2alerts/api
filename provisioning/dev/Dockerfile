FROM ps2alerts/api:base

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        watch \
        htop \
    && rm -rf /var/lib/apt/lists/* /var/cache/apk/*

COPY files/nginx/dev.conf /etc/nginx/sites-enabled
COPY files/php /usr/local/etc/php/conf.d
COPY files/php-fpm /usr/local/etc/php-fpm.d

USER www-data