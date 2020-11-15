resource datadog_monitor "api_not_running" {
  name = "PS2Alerts API not running [${var.environment}]"
  type = "metric alert"
  query = "max(last_1m):avg:kubernetes.pods.running{kube_deployment:ps2alerts-api-${var.environment}} <= 0"
  message = templatefile("${path.module}/../../dd-monitor-message.tmpl", {environment: var.environment, application: "API", description: "not running"})

  thresholds = {
    critical = 0
  }

  notify_no_data = true
  require_full_window = false
  no_data_timeframe = 10

  tags = jsondecode(templatefile("${path.module}/../../dd-tags.tmpl", {environment: var.environment, application: "api"}))
}

resource datadog_monitor "api_high_mem" {
  name = "PS2Alerts API high memory [${var.environment}]"
  type = "metric alert"
  query = "max(last_5m):avg:kubernetes.memory.rss{kube_container_name:ps2alerts-api-${var.environment}} > 235930000"
  message = templatefile("${path.module}/../../dd-monitor-message.tmpl", {environment: var.environment, application: "API", description: "high memory"})

  thresholds = {
    critical = 235930000 # 225MB
  }

  notify_no_data = true
  require_full_window = false
  no_data_timeframe = 10

  tags = jsondecode(templatefile("${path.module}/../../dd-tags.tmpl", {environment: var.environment, application: "api"}))
}

resource datadog_monitor "api_high_cpu" {
  name = "PS2Alerts API high CPU [${var.environment}]"
  type = "metric alert"
  query = "avg(last_5m):avg:kubernetes.cpu.usage.total{kube_container_name:ps2alerts-api-${var.environment}} > 225000000"
  message = templatefile("${path.module}/../../dd-monitor-message.tmpl", {environment: var.environment, application: "API", description: "high CPU"})

  thresholds = {
    critical = 225000000 // 0.225 CPU
  }

  notify_no_data = true
  require_full_window = false
  no_data_timeframe = 10

  tags = jsondecode(templatefile("${path.module}/../../dd-tags.tmpl", {environment: var.environment, application: "api"}))
}

resource datadog_monitor "api_high_errors" {
  name = "PS2Alerts API high errors [${var.environment}]"
  type = "log alert"
  query = "logs(\"container_name:*api\\-${var.environment}* status:error\").index(\"*\").rollup(\"count\").last(\"10m\") > 5"
  message = templatefile("${path.module}/../../dd-monitor-message.tmpl", {environment: var.environment, application: "API", description: "high errors"})

  thresholds = {
    critical = 5
  }

  notify_no_data = true
  require_full_window = false
  no_data_timeframe = 10

  tags = jsondecode(templatefile("${path.module}/../../dd-tags.tmpl", {environment: var.environment, application: "api"}))
}

resource datadog_monitor "api_high_restarts" {
  name = "PS2Alerts API restarts [${var.environment}]"
  type = "query alert"
  query = "change(sum(last_5m),last_5m):avg:kubernetes.containers.restarts{kube_deployment:ps2alerts-api-${var.environment}} > 0.5"
  message = templatefile("${path.module}/../../dd-monitor-message.tmpl", {environment: var.environment, application: "API", description: "restarts"})

  thresholds = {
    critical = 0.5
  }

  notify_no_data = true
  require_full_window = false
  no_data_timeframe = 10

  tags = jsondecode(templatefile("${path.module}/../../dd-tags.tmpl", {environment: var.environment, application: "api"}))
}