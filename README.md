# ps2alerts/api
API system behind PS2Alerts.

THIS PROJECT IS UNDERGOING A VAST RE-REWITE. If you wish to contribute, please join our Discord located at: https://discord.gg/7xF65ap

# Starting the module

Please see the [ps2alerts/stack](https://github.com/ps2alerts/stack) repository for information on how to install the dev environment and start this module.

## Development Environment

### Your vars file

Firstly you need to configure your `vars.local` file in order to load the project and inject the required config. Copy the `provisioning/vars-local.yml.dist` file to `provisioning/vars-local.yml` and configure it to your specification.

To start the development environment up on it's own, run the following command (from this directory):

`ansible-playbook provisioning/dev/start.yml`

Otherwise, use the `ps2alerts-start` command as provided by the stack install process.

