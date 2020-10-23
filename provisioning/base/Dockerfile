FROM node:12

USER root

RUN npm i -g @nestjs/cli

COPY ./files/entrypoint.sh /etc/service/entrypoint.sh

USER node

ENTRYPOINT /etc/service/entrypoint.sh
