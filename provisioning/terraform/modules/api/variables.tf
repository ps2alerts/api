variable "checksum_version" {}
variable "namespace" {}
variable "identifier" {}
variable "environment" {}
variable "database_user" {}
variable "database_pass" {}
variable "database_host" {}
variable "database_port" {}
variable "database_name" {}
variable "database_pool_size" {
  default = 50
}
variable "database_debug" {
  default = false
}
variable "rabbitmq_host" {}
variable "rabbitmq_user" {}
variable "rabbitmq_pass" {}
variable "cpu_limit" {
  default = "250m"
}
variable "mem_limit" {}
variable "cpu_request" {}
variable "mem_request" {}
variable "logger_transports" {
  default = "console"
}
variable "dd_api_key" {}
variable "dd_app_key" {}