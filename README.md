# ps2alerts/api
API system behind PS2Alerts.

THIS PROJECT IS UNDERGOING A VAST RE-REWITE. If you wish to contribute, please join our Discord located at: https://discord.gg/7xF65ap

# Starting the module

Please see the [ps2alerts/stack](https://github.com/ps2alerts/stack) repository for information on how to install the dev environment and start this module.

## Development Environment

### Your vars file

Firstly, copy the `provisioning/vars_local.yml.dist` file to `provisioning/vars_local.yml` and insert your census ID, or this project will not build.

To start just this project on it's own, execute `ps2alerts-api-start` command. You will need to have started the stack prior to this for it to run.

Otherwise, use the `ps2alerts-start` command as provided by the stack install process.