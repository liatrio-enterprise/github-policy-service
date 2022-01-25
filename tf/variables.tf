variable "location" {
  type        = string
  description = "Location to create resources"
  default     = "Central US"
}

variable "function_app_name" {
  type        = string
  description = "Name of the function app to configure"
}

variable "github_webhook_secret" {
  type        = string
  description = "Shared secret for GitHub webhook"
  sensitive   = true
}

variable "github_enforcer_pat" {
  type        = string
  description = "PAT for the protection service to use to enforce protections"
  sensitive   = true
}