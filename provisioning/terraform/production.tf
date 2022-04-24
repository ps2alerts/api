module "api_production" {
  source             = "./modules/api"
  namespace          = "ps2alerts"
  environment        = "production"
  identifier         = "ps2alerts-api-production"
  checksum_version   = var.checksum_version
  database_user      = var.db_user
  database_pass      = var.db_pass
  database_host      = "ps2alerts-db"
  database_port      = 27017
  database_name      = "ps2alerts"
  database_pool_size = 100
  database_debug     = false
  rabbitmq_host      = "ps2alerts-rabbitmq"
  rabbitmq_user      = "ps2alerts"
  rabbitmq_pass      = var.rabbitmq_pass
  rabbitmq_vhost     = "/ps2alerts"
  rabbitmq_queue     = "api-queue-production"
  rabbitmq_prefetch  = 1000
  redis_host         = "ps2alerts-redis-master"
  redis_pass         = var.redis_pass
  redis_port         = 6379
  redis_db           = 1
  cpu_limit          = "500m"
  cpu_limit_cron     = "50m"
  mem_limit          = "0.25Gi"
  mem_limit_cron     = "0.1Gi"
  cpu_request        = "250m"
  cpu_request_cron   = "10m"
  mem_request        = "0.25Gi"
  mem_request_cron   = "0.1Gi"
  logger_transports  = "console"
  multi_urls         = false
  urls               = ["api.ps2alerts.com"]
  internal_api_user  = var.internal_api_user
  internal_api_pass  = var.internal_api_pass
  #  dd_api_key         = var.dd_api_key
  #  dd_app_key         = var.dd_app_key
}
