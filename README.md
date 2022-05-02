# GitHub Policy Service

![CodeQL](https://github.com/liatrio-enterprise/github-policy-service/actions/workflows/codeql-analysis.yml/badge.svg)

GitHub Policy Service is a GitHub App that continuously enforces and maintains branch protection rules on a default branch
as well as associate repositories to their respective teams upon certain org events.

---

### Deployment

GitHub Org Policy Service is deployed to an Azure App Service using GitHub Actions and Terraform.

A push to the main branch will kick off a GitHub Actions workflow that builds a Docker image for the application and
pushes it to [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry).
This image is then pulled by an Azure App Service, which is configured using Terraform.

---

### Features

The GitHub Policy Service utilizes [organization webhooks](https://docs.github.com/en/rest/orgs/webhooks) to respond to
specific events within an organization.

#### Centralized Configuration File

This GitHub app comes with a default configuration for branch protection policy changes, but this configuration can be overridden
on a per-organization level by creating a `github-policy-service.json` file within that organization's `.github` repository.

Currently, this JSON file supports two properties:

- `repositoryWhitelist` is an array of repositories in this organization that will be exempt from policy enforcement.
- `branchProtectionm` is an object with the same properties used within the request body of the [Update Branch Protection](https://docs.github.com/en/rest/branches/branch-protection#update-branch-protection)
  API. You can see an example of these properties within the [default configuration file](https://github.com/liatrio-enterprise/github-policy-service/blob/main/src/config/default.js).

Whenever this file is updated, this GitHub app will hot-reload its configuration based on the contents of this file, and
it will push the policy changes to each non-whitelisted repository within the organization.

#### Branch Protection

This GitHub app will listen for `repository`, `branch_protection_rule`, and `create` webhook events in order to continuously
enforce and maintain branch protection rules on repositories that are created or imported. Once applied, users may no longer
manipulate the branch protection rules that are put in place in the default branch. Any edits to the branch protection rules
will result in a re-application of the original rules. If an edit is made with a name change, a new rule will be created with
the new name. Deleting the default branch rule will result in a reapplication of the rules.

```
Events:
    "repository.created",
    "branch_protection_rule.created",
    "branch_protection_rule.edited",
    "branch_protection_rule.deleted",
    "create"
```

#### Repository Team Management

This GitHub App will also listen for `repository` events in order to associate them with their intended teams. Team names
should be included in the beginning of repo names delimited by a `.`. If a team name is included and the team exists within
the organization, the repository will be associated with that team with `maintain` permissions. 

```
Events:
    "repository.created",
    "repository.edited",
    "repository.renamed",
    "repository.transferred",
    "repository.unarchived"
```

---

### Resources

Some helpful information can be found here:
- https://github.com/octokit/app.js/
- https://github.com/octokit/webhooks.js/

---

### Required secrets

`ARM_CLIENT_ID`,`ARM_CLIENT_SECRET`,`ARM_TENANT_ID`,`ARM_SUBSCRIPTION_ID`: Service principal details for AzureRM authentication

`AZURE_CREDENTIALS`: The above details in the json format that `azure/login@v1` wants 

`TF_BACKEND`: Terraform backend config, base64 encoded
`TF_SECRETS`: Terraform variables bundle, base 64 encoded
