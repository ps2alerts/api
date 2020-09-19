export const config = () => ({
  cors: {},

  database: {
    mongo: {
      type: 'mongodb',
      host: process.env.MONGO_HOST ?? 'localhost',
      port: process.env.MONGO_PORT ?? 27017,
      username: process.env.MONGO_USER ?? 'root',
      password: encodeURIComponent(process.env.MONGO_PASS ?? 'foobar'),
      database: process.env.MONGO_DB ?? 'ps2alerts',
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

  // amqp://${this.config.user}:${this.config.pass}@${this.config.host}:${this.config.port}${vhost}?heartbeat=${this.config.heartbeat}&connection_timeout=${this.config.timeout}

  rabbitmq: {
    url: [process.env.RMQ_URL ?? 'amqp://user:bitnami@localhost:5672'],
    queue: process.env.RMQ_QUEUE ?? 'api-consume-dev',
  },
});
