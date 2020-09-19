import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyHelmet from 'fastify-helmet/index';
import { WsAdapter } from '@nestjs/platform-ws';
import {RmqOptions, Transport} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const config = app.get(ConfigService);

  app.enableCors(config.get('config'));
  app.register(fastifyHelmet);

  app.connectMicroservice<RmqOptions>({
    transport: Transport.RMQ,
    options: {
      urls: config.get('rabbitmq.url'),
      queue: config.get('rabbitmq.queue'),
      queueOptions: {
        durable: true,
      },
    },
  });

  app.useWebSocketAdapter(new WsAdapter(app));

  await app.startAllMicroservicesAsync();
  await app.listen(config.get('http.port'));
}

void bootstrap();
