import {NestFactory} from '@nestjs/core';
import {FastifyAdapter, NestFastifyApplication} from '@nestjs/platform-fastify';
import fastifyHelmet from 'fastify-helmet/index';
import {WsAdapter} from '@nestjs/platform-ws';
import {RmqOptions, Transport} from '@nestjs/microservices';
import {ConfigService} from '@nestjs/config';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
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

    // Swagger
    // const options = new DocumentBuilder()
    //     .setTitle('Cats example')
    //     .setDescription('The cats API description')
    //     .setVersion('1.0')
    //     .addTag('cats')
    //     .build();
    // const document = SwaggerModule.createDocument(app, options);
    // SwaggerModule.setup('api', app, document);

    app.useWebSocketAdapter(new WsAdapter(app));

    await app.startAllMicroservicesAsync();
    const port = config.get('http.port') ?? 3000;
    await app.listen(port);
    console.log(`Web server listening on port: ${port}`);
}

void bootstrap();
