export const config = () => ({
  cors: {},

  database: {
    mongo: {
      type: 'mongodb',
      host: process.env.MONGO_HOST ?? 'localhost',
      port: process.env.MONGO_PORT ?? 27017,
      database: process.env.MONGO_DATABASE ?? 'ps2alerts-api',
      logging: false,
      useUnifiedTopology: true,
      useNewUrlParser: true,
      synchronize: true,
    },
  },

  http: {
    port: parseInt(process.env.PORT, 10) ?? 3000,
  },

  rabbitmq: {
    url: [process.env.RMQ_URL ?? 'amqp://localhost:5672'],
    queue: process.env.RMQ_QUEUE ?? 'websocket',
  },
});