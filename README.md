# GitHub Org Policy Service

Github Org Policy Service is a Github App that enforces and maintains branch protection rules on a default branch for repositories that are created in a Github organization.

---

### Deployment

Github Org Policy Service is deployed to an Azure App Service using Github Actions and Terraform.

A push to main will kick off a Github Actions workflow that builds a Docker image of our app and pushes it to [Github Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry). This image is then pulled by an Azure App Service, which is setup using Terraform.

---

### Usage

This Github App will listen to an `.on` webhook event for when a repository is created, when a new branch is created in a respository, as well as anytime branch protection rules are created, edited, or deleted. More events can be added the array of events that are being listened for. When these events are triggered by a user, the preset branch protection rules will re-apply on the default branch.

An example of the branch protection rules we use can be found here: [branch protection rules](https://github.com/liatrio/github-org-policy-service/blob/main/app.js#L42-L58)

---

### Development

Some helpful resources can be found here:
- https://github.com/octokit/app.js/
- https://github.com/octokit/webhooks.js/

---

### Required secrets

`ARM_CLIENT_ID`,`ARM_CLIENT_SECRET`,`ARM_TENANT_ID`,`ARM_SUBSCRIPTION_ID`: Service principal details for AzureRM authentication

`AZURE_CREDENTIALS`: The above details in the json format that `azure/login@v1` wants 

`TF_BACKEND`: Terraform backend config, base64 encoded
`TF_SECRETS`: Terraform variables bundle, base 64 encoded
