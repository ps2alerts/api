// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const config = () => ({
    cors: {},

    database: {
        mongo: {
            type: 'mongodb',
            host: process.env.DB_HOST ?? 'ps2alerts-db',
            port: process.env.DB_PORT ?? 27017,
            username: process.env.DB_USER ?? 'root',
            password: encodeURIComponent(process.env.DB_PASS ?? 'foobar'),
            database: process.env.DB_NAME ?? 'ps2alerts',
            poolSize: 30,
            logging: false,
            authSource: 'admin',
            useUnifiedTopology: false,
            useNewUrlParser: false,
        },
    },

    http: {
        port: parseInt((process.env.PORT ?? '3000'), 10),
    },

    rabbitmq: {
        url: [process.env.MQ_URL ?? 'amqp://user:bitnami@ps2alerts-mq:5672'],
        queue: process.env.MQ_QUEUE ?? 'api-consume-dev',
    },
});
