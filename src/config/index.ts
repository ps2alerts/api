// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const config = () => ({
    cors: {},

    env: process.env.NODE_ENV,

    database: {
        mongo: {
            type: 'mongodb',
            host: process.env.DB_HOST ?? 'localhost',
            port: process.env.DB_PORT ?? 27017,
            username: process.env.DB_USER ?? 'root',
            password: encodeURIComponent(process.env.DB_PASS ?? 'foobar'),
            database: process.env.DB_NAME ?? 'ps2alerts',
            synchronize: true,
            logging: true,
            poolSize: process.env.DB_POOL_SIZE ?? 50,
            authSource: 'admin',
            useUnifiedTopology: false,
            useNewUrlParser: false,
        },
    },

    http: {
        port: parseInt((process.env.HTTP_PORT ?? '3000'), 10),
    },

    rabbitmq: {
        url: [process.env.RABBITMQ_URL ?? `amqp://${process.env.RABBITMQ_USER ?? 'user'}:${process.env.RABBITMQ_PASS ?? 'bitnami'}@${process.env.RABBITMQ_HOST ?? 'localhost'}:5672${process.env.RABBITMQ_VHOST ?? ''}?heartbeat=10&connection_timeout=10000`],
        queue: process.env.RABBITMQ_QUEUE ?? 'api-queue',
        shortDelayQueue: process.env.RABBITMQ_SHORT_DELAY_QUEUE ?? 'api-queue-delay-5min',
    },

    redis: {
        host: process.env.REDIS_HOST ?? 'ps2alerts-redis',
        port: process.env.REDIS_PORT ?? 6379,
        password: process.env.REDIS_PASS ?? undefined,
        db: process.env.REDIS_DB ?? 1,
    },
});
