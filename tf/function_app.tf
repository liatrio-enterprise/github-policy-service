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

  # NOTE: If deploying app via Terraform you would uncomment this
  # site_config {
  #   linux_fx_version = "DOCKER|azuredemoshared.azurecr.io/${var.image_name}:${var.image_version}"
  # }
  site_config {
    linux_fx_version = "node|14"
  }

  os_type = "linux"
  version = "~3"

  app_settings = {
    WEBHOOK_SECRET : var.github_webhook_secret
    FUNCTIONS_WORKER_RUNTIME : "node"
    WEBSITE_RUN_FROM_PACKAGE : ""
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