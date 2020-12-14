variable "checksum_version" {}
variable "namespace" {}
variable "identifier" {}
variable "environment" {}
variable "database_user" {
  sensitive = true
}
variable "database_pass" {
  sensitive = true
}
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
variable "rabbitmq_user" {
  sensitive = true
}
variable "rabbitmq_pass" {
  sensitive = true
}
variable "rabbitmq_vhost" {}
variable "rabbitmq_queue" {}
variable "rabbitmq_prefetch" {}
variable "cpu_limit" {}
variable "cpu_limit_cron" {}
variable "mem_limit" {}
variable "mem_limit_cron" {}
variable "cpu_request" {}
variable "cpu_request_cron" {}
variable "mem_request" {}
variable "mem_request_cron" {}
variable "logger_transports" {
  default = "console"
}
variable "dd_api_key" {}
variable "dd_app_key" {}
variable "multi_urls" {}
variable "urls" {}