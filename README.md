# ps2alerts-api
API system behind PS2Alerts

[![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/Maelstromeous/ps2alerts-api/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/Maelstromeous/ps2alerts-api/?branch=master)

# Starting the module

Please read the Stack module README.md in order to get the requirements to run this project.

## Development Environment

### Your vars file

Firstly you need to configure your `vars.local` file in order to load the project and inject the required config. Copy the `provisioning/vars-local.yml.dist` file to `provisioning/vars-local.yml` and configure it to your specification.

To start the development environment up, run the following command (from this directory):

`ansible-playbook provisioning/dev/start.yml`

