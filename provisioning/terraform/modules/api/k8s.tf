resource "kubernetes_service" "ps2alerts_api_service" {
  metadata {
    name = var.identifier
    namespace = var.namespace
    labels = {
      app = var.identifier
      environment = var.environment
    }
  }
  spec {
    type = "ClusterIP"
    selector = {
      app = var.identifier
      environment = var.environment
    }
    port {
      port = 443
      target_port = 3000
    }
  }
}

resource "kubernetes_deployment" "ps2alerts_api_deployment" {
  metadata {
    name = var.identifier
    namespace = var.namespace
    labels = {
      app = var.identifier
      environment = var.environment
    }
  }
  lifecycle {
    ignore_changes = ["spec[0].replicas"]
  }
  spec {
    replicas = 2
    revision_history_limit = 1
    selector {
      match_labels = {
        app = var.identifier
        environment = var.environment
      }
    }
    template {
      metadata {
        labels = {
          app = var.identifier
          environment = var.environment
        }
      }
      spec {
        image_pull_secrets {
          name = "regcred"
        }
        container {
          name = var.identifier
          image = join("", ["maelstromeous/applications:", var.identifier, "-", var.checksum_version])
          liveness_probe {
            http_get {
              path = "/static/index.html"
              port = 3000
            }
            initial_delay_seconds = 120
            period_seconds        = 30
            success_threshold     = 1
            failure_threshold     = 4
            timeout_seconds       = 10
          }
          readiness_probe {
            http_get {
              path = "/static/index.html"
              port = 3000
            }
            initial_delay_seconds = 30
            period_seconds        = 30
            success_threshold     = 1
            failure_threshold     = 4
            timeout_seconds       = 10
          }
          resources {
            limits {
              cpu = var.cpu_limit
              memory = var.mem_limit
            }
            requests {
              cpu = var.cpu_request
              memory = var.mem_request
            }
          }
          port {
            container_port = 3000
          }
          env {
            name = "NODE_ENV"
            value = var.environment
          }
          env {
            name = "VERSION"
            value = var.checksum_version
          }
          env {
            name = "DB_USER"
            value = var.database_user
          }
          env {
            name = "DB_PASS"
            value = var.database_pass
          }
          env {
            name = "DB_HOST"
            value = var.database_host
          }
          env {
            name = "DB_PORT"
            value = var.database_port
          }
          env {
            name = "DB_NAME"
            value = var.database_name
          }
          env {
            name = "DB_DEBUG"
            value = var.database_debug
          }
          env {
            name = "DB_POOL_SIZE"
            value = var.database_pool_size
          }
          env {
            name = "RABBITMQ_HOST"
            value = var.rabbitmq_host
          }
          env {
            name = "RABBITMQ_USER"
            value = var.rabbitmq_user
          }
          env {
            name = "RABBITMQ_PASS"
            value = var.rabbitmq_pass
          }
          env {
            name = "RABBITMQ_VHOST"
            value = var.rabbitmq_vhost
          }
          env {
            name = "RABBITMQ_QUEUE"
            value = var.rabbitmq_queue
          }
          env {
            name = "RABBITMQ_PREFETCH"
            value = var.rabbitmq_prefetch
          }
          env {
            name = "AGGREGATOR_ENABLED"
            value = true
          }
          env {
            name = "CRON_ENABLED"
            value = false
          }
          env {
            name = "RABBITMQ_PREFETCH"
            value = var.rabbitmq_prefetch
          }
          env {
            name = "LOGGER_TRANSPORTS"
            value = var.logger_transports
          }
        }
      }
    }
  }
}

resource "kubernetes_deployment" "ps2alerts_api_cron_deployment" {
  metadata {
    name = join("-", [var.identifier, "cron"])
    namespace = var.namespace
    labels = {
      app = join("-", [var.identifier, "cron"])
      environment = var.environment
    }
  }
  spec {
    replicas = 1
    revision_history_limit = 1
    selector {
      match_labels = {
        app = join("-", [var.identifier, "cron"])
        environment = var.environment
      }
    }
    template {
      metadata {
        labels = {
          app = join("-", [var.identifier, "cron"])
          environment = var.environment
        }
      }
      spec {
        image_pull_secrets {
          name = "regcred"
        }
        container {
          name = join("-", [var.identifier, "cron"])
          image = join("", ["maelstromeous/applications:", var.identifier, "-", var.checksum_version])
          liveness_probe {
            http_get {
              path = "/static/index.html"
              port = 3000
            }
            initial_delay_seconds = 120
            period_seconds        = 30
            success_threshold     = 1
            failure_threshold     = 4
            timeout_seconds       = 10
          }
          readiness_probe {
            http_get {
              path = "/static/index.html"
              port = 3000
            }
            initial_delay_seconds = 30
            period_seconds        = 30
            success_threshold     = 1
            failure_threshold     = 4
            timeout_seconds       = 10
          }
          resources {
            limits {
              cpu = var.cpu_limit_cron
              memory = var.mem_limit_cron
            }
            requests {
              cpu = var.cpu_request_cron
              memory = var.mem_request_cron
            }
          }
          port {
            container_port = 3000
          }
          env {
            name = "NODE_ENV"
            value = var.environment
          }
          env {
            name = "VERSION"
            value = var.checksum_version
          }
          env {
            name = "DB_USER"
            value = var.database_user
          }
          env {
            name = "DB_PASS"
            value = var.database_pass
          }
          env {
            name = "DB_HOST"
            value = var.database_host
          }
          env {
            name = "DB_PORT"
            value = var.database_port
          }
          env {
            name = "DB_NAME"
            value = var.database_name
          }
          env {
            name = "DB_DEBUG"
            value = var.database_debug
          }
          env {
            name = "DB_POOL_SIZE"
            value = var.database_pool_size
          }
          env {
            name = "RABBITMQ_HOST"
            value = var.rabbitmq_host
          }
          env {
            name = "RABBITMQ_USER"
            value = var.rabbitmq_user
          }
          env {
            name = "RABBITMQ_PASS"
            value = var.rabbitmq_pass
          }
          env {
            name = "RABBITMQ_VHOST"
            value = var.rabbitmq_vhost
          }
          env {
            name = "RABBITMQ_QUEUE"
            value = var.rabbitmq_queue
          }
          env {
            name = "RABBITMQ_PREFETCH"
            value = var.rabbitmq_prefetch
          }
          env {
            name = "AGGREGATOR_ENABLED"
            value = false
          }
          env {
            name = "CRON_ENABLED"
            value = true
          }
          env {
            name = "RABBITMQ_PREFETCH"
            value = var.rabbitmq_prefetch
          }
          env {
            name = "LOGGER_TRANSPORTS"
            value = var.logger_transports
          }
        }
      }
    }
  }
}

resource "kubernetes_ingress" "ps2alerts_api_ingress" {
  count = var.multi_urls ? 0 : 1
  metadata {
    name = var.identifier
    namespace = var.namespace
    labels = {
      app = var.identifier
      environment = var.environment
    }
    annotations = {
      "kubernetes.io/ingress.class" = "nginx"
      "cert-manager.io/cluster-issuer" = var.identifier
      "nginx.ingress.kubernetes.io/proxy-body-size" = "10m"
    }
  }
  spec {
    backend {
      service_name = kubernetes_service.ps2alerts_api_service.metadata[0].name
      service_port = kubernetes_service.ps2alerts_api_service.spec[0].port[0].port
    }
    tls {
      hosts = var.urls
      secret_name = var.identifier
    }
    rule {
      host = var.urls[0]
      http {
        path {
          backend {
            service_name = var.identifier
            service_port = 3000
          }
        }
      }
    }
  }
}

resource "kubernetes_ingress" "ps2alerts_website_ingress_multi" {
  count = var.multi_urls ? 1 : 0
  metadata {
    name = var.identifier
    namespace = var.namespace
    labels = {
      app = var.identifier
      environment = var.environment
    }
    annotations = {
      "kubernetes.io/ingress.class" = "nginx"
      "cert-manager.io/cluster-issuer" = var.identifier
      "nginx.ingress.kubernetes.io/proxy-body-size" = "10m"
    }
  }
  spec {
    backend {
      service_name = kubernetes_service.ps2alerts_api_service.metadata[0].name
      service_port = kubernetes_service.ps2alerts_api_service.spec[0].port[0].port
    }
    tls {
      hosts = var.urls
      secret_name = var.identifier
    }
    rule {
      host = var.urls[0]
      http {
        path {
          backend {
            service_name = var.identifier
            service_port = 3000
          }
        }
      }
    }
    rule {
      host = var.urls[1]
      http {
        path {
          backend {
            service_name = var.identifier
            service_port = 3000
          }
        }
      }
    }
  }
}