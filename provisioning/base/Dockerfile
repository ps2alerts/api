FROM node:12

USER root

COPY ./files/entrypoint.sh /etc/service/entrypoint.sh

RUN npm i -g @nestjs/cli

USER node

ENTRYPOINT /etc/service/entrypoint.sh
