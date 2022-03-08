FROM node:16
USER root
RUN yarn global add @nestjs/cli
COPY ./files/entrypoint.sh /etc/service/entrypoint.sh

USER node
ENTRYPOINT /etc/service/entrypoint.sh
