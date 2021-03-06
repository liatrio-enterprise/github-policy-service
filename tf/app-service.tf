resource "azurerm_resource_group" "github_org_protection_service" {
  location = var.location
  name     = "github-org-protection-service"
}

resource "azurerm_storage_account" "branch_protection_service" {
  name                     = "liatriogops"
  resource_group_name      = azurerm_resource_group.github_org_protection_service.name
  location                 = azurerm_resource_group.github_org_protection_service.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_app_service_plan" "branch_protection_service" {
  name                = var.app_service_name
  location            = azurerm_resource_group.github_org_protection_service.location
  resource_group_name = azurerm_resource_group.github_org_protection_service.name
  kind                = "Linux"
  reserved            = true

  sku {
    tier = "Basic"
    size = "B1"
  }
}

resource "azurerm_app_service" "branch_protection_service" {
  app_service_plan_id = azurerm_app_service_plan.branch_protection_service.id
  location            = azurerm_resource_group.github_org_protection_service.location
  name                = var.app_service_name
  resource_group_name = azurerm_resource_group.github_org_protection_service.name

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on                            = true
    acr_use_managed_identity_credentials = true
    health_check_path                    = "/healthcheck"
  }

  logs {
    failed_request_tracing_enabled  = true
    detailed_error_messages_enabled = true
    http_logs {
      file_system {
        retention_in_days = 0
        retention_in_mb   = 35
      }
    }
    application_logs {
      file_system_level = "Information"
    }
  }

  app_settings = {
    DEBUG : "*"
    WEBSITE_PORT : 3000
    WEBHOOK_SECRET : var.github_webhook_secret
    GITHUB_APP_ID : var.gh_app_id
    GITHUB_APP_PRIVATE_KEY : var.gh_app_private_key
    GITHUB_APP_CLIENT_ID : var.gh_app_client_id
    GITHUB_APP_CLIENT_SECRET : var.gh_app_client_secret
  }
}
