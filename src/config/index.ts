export const config = () => ({
  cors: {},

  database: {
    mongo: {
      type: 'mongodb',
      host: process.env.MONGO_HOST || 'localhost',
      port: process.env.MONGO_PORT || 27017,
      database: process.env.MONGO_DATABASE || 'ps2alerts-api',
      logging: false,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    },
  },

  http: {
    port: parseInt(process.env.PORT, 10) || 3000,
  },

  rabbitmq: {
    url: ['amqp://localhost:5672'],
    queue: process.env.QUEUE || 'websocket',
  },
});
