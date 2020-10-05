FROM node:12

USER root

COPY ./files/entrypoint.sh /etc/service/entrypoint.sh

USER node

RUN npm i -g @nestjs/cli

ENTRYPOINT /etc/service/entrypoint.sh
