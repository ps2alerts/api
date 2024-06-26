import {NestFactory, BaseExceptionFilter, HttpAdapterHost} from '@nestjs/core';
import {FastifyAdapter, NestFastifyApplication} from '@nestjs/platform-fastify';
import {RmqOptions, Transport} from '@nestjs/microservices';
import {ConfigService} from '@nestjs/config';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {ValidationPipe} from '@nestjs/common';
import {TypeOrmFilter} from './filters/type-orm.filter';
import compression from '@fastify/compress';
import {fastifyHelmet} from '@fastify/helmet';
import './instrument.js';
import * as Sentry from '@sentry/node';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({
            logger: process.env.NODE_ENV === 'development',
        }),
        {
            logger: process.env.NODE_ENV === 'development' ? ['debug', 'log', 'warn', 'error'] : ['log', 'warn', 'error'],
        },
    );

    // Sentry stuff
    const {httpAdapter} = app.get(HttpAdapterHost);
    Sentry.setupNestErrorHandler(app, new BaseExceptionFilter(httpAdapter));

    const config = app.get(ConfigService);

    // Fastify stuff
    app.enableCors(config.get('config'));
    void app.register(fastifyHelmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ['\'self\''],
                styleSrc: ['\'self\'', '\'unsafe-inline\''],
                imgSrc: ['\'self\'', 'data:', 'validator.swagger.io'],
                scriptSrc: ['\'self\'', 'https: \'unsafe-inline\''],
            },
        },
    });
    void app.register(compression, {encodings: ['gzip', 'deflate']});

    // Type ORM stuff
    app.useGlobalFilters(new TypeOrmFilter());
    app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true, disableErrorMessages: false}));

    if (process.env.AGGREGATOR_ENABLED === 'true') {
        app.connectMicroservice<RmqOptions>({
            transport: Transport.RMQ,
            options: {
                urls: config.get('rabbitmq.url'),
                queue: config.get('rabbitmq.queue'),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                queueOptions: config.get('rabbitmq.queueOptions'),
                noAck: config.get('rabbitmq.noAck'),
                prefetchCount: config.get('rabbitmq.prefetchCount'),
            },
        });
    }

    // Swagger stuff
    const options = new DocumentBuilder()
        .setTitle('PS2Alerts API')
        .setDescription('PS2Alerts API. Please visit our <a href="https://github.com/ps2alerts/api">GitHub project</a> for more information or to support the project. <br><br>There are the following limits applied to this API: <br><ol><li>You are limited to taking 1000 maximum documents from any */global/* endpoint, you must then paginate thereafter. */instance/* endpoints don\'t have such limitations.</li><li>There are <b>currently</b> no rate limits, however requests are being monitored and any abuse will result in rate limit implementation.</li></ol>')
        .setVersion(process.env.VERSION ?? 'UNKNOWN')
        .addBasicAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('/', app, document);

    // Connects to Rabbit etc
    void app.startAllMicroservices();

    await app.listen(config.get('http.port') ?? 3000, '0.0.0.0');
}

void bootstrap();
