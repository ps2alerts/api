# ps2alerts/api
API system behind PS2Alerts.

THIS PROJECT IS UNDERGOING A VAST RE-REWITE. If you wish to contribute, please join our Discord located at: https://discord.gg/7xF65ap

# Starting the module

Please see the [ps2alerts/stack](https://github.com/ps2alerts/stack) repository for information on how to install the dev environment and start this module.

## Development Environment

### Your vars file

Firstly, copy the `provisioning/vars_local.yml.dist` file to `provisioning/vars_local.yml` and insert your census ID, or this project will not build.

To start just this project on its own, execute `ps2alerts-api-start` command. You will need to have started the stack prior to this for it to run.

Otherwise, use the `ps2alerts-start` command as provided by the stack install process.

# Responsibilities

The API is a very dumb overlay over MongoDB, which inserts and updates data.

## Interaction with PS2Alerts Aggregator

The [PS2Alerts Census Aggregator](https://github.com/ps2alerts/websocket) consumes data coming in from Census and generates aggregates / statistics for us to store. The API in this case is the one that goes ahead and stores the data into MongoDB.

The Aggregator service issues the data to be passed to the API over a RabbitMQ queue. The API consumes this queue, and routes it to the endpoint controllers via a feature within NestJS called `MessagePattern`. This forwards anything listening on this message pattern to the endpoint in question.

In order for this to work, messages must be supplied to the queue NestJS is listening to in the following format:

```
{
  "pattern": "instanceDeath",
  "data": {
    "foo": "bar"
  }
}
```

Here, any endpoint / function with `@MessagePattern('instanceDeath')` will consume the message and process it.
