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
  name                = var.function_app_name
  location            = azurerm_resource_group.github_org_protection_service.location
  resource_group_name = azurerm_resource_group.github_org_protection_service.name
  kind                = "FunctionApp"
  reserved            = true

  sku {
    tier = "Dynamic"
    size = "Y1"
  }
}

resource "azurerm_function_app" "branch_protection_service" {
  name                       = var.function_app_name
  location                   = azurerm_resource_group.github_org_protection_service.location
  resource_group_name        = azurerm_resource_group.github_org_protection_service.name
  app_service_plan_id        = azurerm_app_service_plan.branch_protection_service.id
  storage_account_name       = azurerm_storage_account.branch_protection_service.name
  storage_account_access_key = azurerm_storage_account.branch_protection_service.primary_access_key

  site_config {
    health_check_path = "/"
  }

  os_type = "linux"
  version = "~3"

  app_settings = {
    WEBHOOK_SECRET : var.github_webhook_secret
    GITHUB_APP_ID : var.gh_app_id
    GITHUB_APP_PRIVATE_KEY : var.gh_app_private_key
    GITHUB_APP_CLIENT_ID : var.gh_app_client_id
    GITHUB_APP_CLIENT_SECRET : var.gh_app_client_secret
  }

  lifecycle {
    ignore_changes = [
      app_settings["WEBSITE_RUN_FROM_PACKAGE"],
      app_settings["WEBSITE_ENABLE_SYNC_UPDATE_SITE"],
    ]
  }
}