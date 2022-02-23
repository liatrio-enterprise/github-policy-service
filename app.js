const { App, createNodeMiddleware } = require("@octokit/app");
const express = require("express");

const branchProtection = require("./handlers/branch-protection");
const repoTeamManager = require("./handlers/repo-team-manager");

const expressApp = express();

expressApp.use(express.json());

require("dotenv").config();

const app = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
    oauth: {
        clientId: process.env.GITHUB_APP_CLIENT_ID,
        clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
    },
    webhooks: {
        secret: process.env.WEBHOOK_SECRET,
    },
});

app.webhooks.on([
    "repository.created",
    "branch_protection_rule.created",
    "branch_protection_rule.edited",
    "branch_protection_rule.deleted",
    "create",
], branchProtection);

app.webhooks.on([
    "repository.created",
    "repository.edited",
    "repository.renamed",
    "repository.transferred",
    "repository.unarchived",
], repoTeamManager);

expressApp.use(createNodeMiddleware(app));

expressApp.get("/", (request, response) => {
    response.send("ok");
});

expressApp.get("/healthcheck", (request, response) => {
    response.send("ok");
});

const port = process.env.PORT || 3000;
expressApp.listen(port, "0.0.0.0");

