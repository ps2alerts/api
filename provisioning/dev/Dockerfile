FROM ps2alerts:base

USER root

COPY files/nginx /etc/nginx/conf.d
COPY files/php /usr/local/etc/php/conf.d
COPY files/php-fpm /usr/local/etc/php-fpm.d

USER www-data