# ps2alerts/api
API system behind PS2Alerts.

THIS PROJECT IS UNDERGOING A VAST RE-REWITE. If you wish to contribute, please join our Discord located at: https://discord.gg/7xF65ap

# Starting the module

Please see the [ps2alerts/stack](https://github.com/ps2alerts/stack) repository for information on how to install the dev environment and start this module.

## Development Environment

To start the environment, execute `ps2alerts-api-start`. If you don't have this command available, pull in the [Stack](https://github.com/ps2alerts/stack) and follow the instructions there to get set up properly.

### Local vars file

Firstly before starting the environment, copy the `provisioning/vars_local.yml.dist` file to `provisioning/vars_local.yml` and insert your census ID, or this project will not start.

To start just this project on its own, execute `ps2alerts-api-start` command. You will need to have started the stack prior to this for it to run (`ps2alerts-stack-start`)

Otherwise, use the `ps2alerts-start` command as provided by the stack install process to boot the entire environment.