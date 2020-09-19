export const config = () => ({
  cors: {},

  database: {
    mongo: {
      type: 'mongodb',
      host: process.env.MONGO_HOST ?? 'localhost',
      port: process.env.MONGO_PORT ?? 27017,
      database: process.env.MONGO_DATABASE ?? 'ps2alerts',
      logging: false,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      synchronize: true,
    },
  },

  http: {
    port: parseInt(process.env.PORT, 10) ?? 3000,
  },

  // amqp://${this.config.user}:${this.config.pass}@${this.config.host}:${this.config.port}${vhost}?heartbeat=${this.config.heartbeat}&connection_timeout=${this.config.timeout}

  rabbitmq: {
    url: [process.env.RMQ_URL ?? 'amqp://user:bitnami@localhost:5672'],
    queue: process.env.RMQ_QUEUE ?? 'api-consume-dev',
  },
});
