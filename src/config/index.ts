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
    port: parseInt(process.env.PORT, 10) ?? 3000,
  },

  rabbitmq: {
    url: [process.env.MQ_URL ?? 'amqp://user:bitnami@ps2alerts-mq:5672'],
    queue: process.env.MQ_QUEUE ?? 'api-consume-dev',
  },
});
