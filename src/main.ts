import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyHelmet from 'fastify-helmet/index';
import { WsAdapter } from '@nestjs/platform-ws';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const config = app.get(ConfigService);

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      url: config.get('rabbitmq.url'),
      queue: config.get('rabbitmq.queue'),
      queueOptions: {
        durable: false,
      },
    },
  });

  app.useWebSocketAdapter(new WsAdapter(app));

  app.register(fastifyHelmet);
  app.enableCors();

  await app.startAllMicroservicesAsync();
  await app.listen(config.get<number>('http.port'));
}

void bootstrap();
