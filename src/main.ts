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
        new FastifyAdapter({
            logger: process.env.NODE_ENV === 'development',
        }),
    );

    const config = app.get(ConfigService);

    app.enableCors(config.get('config'));
    app.register(fastifyHelmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ['\'self\''],
                styleSrc: ['\'self\'', '\'unsafe-inline\''],
                imgSrc: ['\'self\'', 'data:', 'validator.swagger.io'],
                scriptSrc: ['\'self\'', 'https: \'unsafe-inline\''],
            },
        },
    });

    app.connectMicroservice<RmqOptions>({
        transport: Transport.RMQ,
        options: {
            urls: config.get('rabbitmq.url'),
            queue: config.get('rabbitmq.queue'),
            queueOptions: {
                durable: true,
                messageTtl: 7200000,
            },
            noAck: false,
            prefetchCount: 1000,
        },
    });

    app.useWebSocketAdapter(new WsAdapter(app));

    const options = new DocumentBuilder()
        .setTitle('PS2Alerts API')
        .setDescription('PS2Alerts API documentation')
        .setVersion('3.0-alpha')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/', app, document);

    // Connects to Rabbit etc
    await app.startAllMicroservicesAsync();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const port = config.get('http.port') ?? 3000;
    await app.listen(port, '0.0.0.0');
    // eslint-disable-next-line no-console
    console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
