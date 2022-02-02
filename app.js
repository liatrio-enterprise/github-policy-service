const { App, createNodeMiddleware } = require("@octokit/app");
const express = require("express");
const expressApp = express();
const branch_protection = require("./handlers/branch_protection.js");
const repo_team_manager = require("./handlers/repo_team_manager.js");

expressApp.use(express.json())
expressApp.use((req, res, next) => {
    console.log(JSON.stringify({ headers: req.headers, body: req.body }));
    next();
})

require('dotenv').config()

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
    "create"
], branch_protection);

app.webhooks.on([
    "repository.created",
    "repository.edited",
    "repository.renamed",
    "repository.transferred",
    "repository.unarchived"
], repo_team_manager);

expressApp.use(createNodeMiddleware(app));

expressApp.get('/', (req, res) => {
    console.log(`Healthcheck on ${req.path}`)
    res.send('ok')
})

expressApp.get('/healthcheck', (req, res) => {
    console.log(`Healthcheck on ${req.path}`)
    res.send('ok')
})

const port = process.env.PORT || 3000;
expressApp.listen(port, '0.0.0.0');


