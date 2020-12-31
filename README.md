# ps2alerts/api

This project is currently under development. If you wish to contribute, please join our Discord located at: https://discord.gg/7xF65ap and check out the channel _#if-you-wish-to-contribute_.

# Starting the module

To start the environment for the first time, execute `ps2alerts-api-init`. If you don't have this command available, pull in the [Stack](https://github.com/ps2alerts/stack) and follow the instructions there to get set up properly.

tl;dr:

`ps2alerts-stack-start` if stack not already started. If you wish to see output of this module, run `ps2alerts-api-dev`. 

# Responsibilities

The API is a very dumb overlay over MongoDB, which inserts and updates data. It acts as a single source of truth for data access.

# Interaction with PS2Alerts Aggregator

The [PS2Alerts Aggregator](https://github.com/ps2alerts/websocket) consumes data coming in from the Census Streaming Service and generates aggregates / statistics for us to store. 

The Aggregator service pushes the data to the API over a RabbitMQ queue. The API consumes this queue, and routes it to the endpoint controllers via a feature within NestJS called `MessagePattern`. This forwards anything listening on this message pattern to the endpoint / controller in question.

In order for this to work, messages must be supplied to the queue NestJS is listening to in the following format:

```
{
  "pattern": "instanceDeath",
  "data": {
    "foo": "bar"
  }
}
```

Here, any endpoint / function with `@EventPattern('instanceDeath')` will consume the message and process it.
