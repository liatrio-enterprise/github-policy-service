# GitHub Policy Service

Github Policy Service is a Github App that enforces and maintains branch protection rules on a default branch as well as associate repositories to their respective teams upon certain org events.

---

### Deployment

Github Org Policy Service is deployed to an Azure App Service using Github Actions and Terraform.

A push to main will kick off a Github Actions workflow that builds a Docker image of our app and pushes it to [Github Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry). This image is then pulled by an Azure App Service, which is setup using Terraform.

---

### Usage
#### Branch Protection

This Github app will listen for `repository`, `branch_protection_rule`, and `create` webhook events in order to enforce and maintain branch protection rules on repos that may be created or imported. Once applied, users may no longer manipulate the branch protection rules that are put in place in the default branch. Any edits to the branch protection rules will result in reenforcement of the original rules. If an edit is made with a name change, a new rule will be created with the new name. Deleting the default branch rule will result in a reapplication of the rules.
```
Events:
    "repository.created",
    "branch_protection_rule.created",
    "branch_protection_rule.edited",
    "branch_protection_rule.deleted",
    "create"
```

#### Repo Management

This Github App will also listen for `repository` events in order to associate them with their intended teams. A list of teams belonging to the current org will be retrieved and compared against the repo that is being created/edited. Repos with `maintain` permissions will be added to the teams that a match is found for.

> **_NOTE:_**  Our current logic uses [`.startsWith()`](https://www.w3schools.com/jsref/jsref_startswith.asp) to associate repos to teams. This means that repos with team names that are substrings of other teams will also be added to those teams.

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
