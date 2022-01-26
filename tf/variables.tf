variable "location" {
  type        = string
  description = "Location to create resources"
  default     = "Central US"
}

variable "app_service_name" {
  type        = string
  description = "Name of the function app to configure"
}

variable "github_webhook_secret" {
  type        = string
  description = "Shared secret for GitHub webhook"
  sensitive   = true
}

variable "gh_app_id" {
  type        = string
  description = "GitHub app ID"
  sensitive   = true
}

variable "gh_app_private_key" {
  type        = string
  description = "GitHub app private key"
  sensitive   = true
}

variable "gh_app_client_id" {
  type        = string
  description = "GitHub app client ID"
  sensitive   = true
}

variable "gh_app_client_secret" {
  type        = string
  description = "GitHub app client secret"
  sensitive   = true
}
