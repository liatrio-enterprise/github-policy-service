# GitHub Org Protection Service

Required secrets:

`ARM_CLIENT_ID`,`ARM_CLIENT_SECRET`,`ARM_TENANT_ID`,`ARM_SUBSCRIPTION_ID`: Service principal details for AzureRM authentication

`AZURE_CREDENTIALS`: The above details in the json format that `azure/login@v1` wants 

`TF_BACKEND`: Terraform backend config, base64 encoded
`TF_SECRETS`: Terraform variables bundle, base 64 encoded