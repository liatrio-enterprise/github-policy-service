const { App, createNodeMiddleware } = require("@octokit/app");
require('dotenv').config()
import express from "express";

const expressApp = express();

const app = new App({
    appId: process.env.APP_ID,
    privateKey: process.env.PRIVATE_KEY,
    oauth: {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
    },
    webhooks: {
        secret: "secret",
    },
});

app.webhooks.on("repository.created", async ({ octokit, payload }) => {

    // console.log(payload);
    // console.log(`Configuring branch protection for repo ${payload.repository.name}`)
    await octokit.request(
        "PUT /repos/{owner}/{repo}/branches/{branch}/protection",
        {
            owner: payload.repository.owner.login,
            repo: payload.repository.name,
            branch: payload.repository.default_branch,
            required_status_checks: {
                contexts: [],
                strict: true,
            },
            enforce_admins: true,
            required_pull_request_reviews: {
                dismiss_stale_reviews: true,
                required_approving_review_count: 1,
            },
            required_linear_history: true,
            allow_force_pushes: false,
            allow_deletions: false,
            required_conversation_resolution: true,
            restrictions: null,
        }
    );

});

expressApp.use(createNodeMiddleware(app));

expressApp.get('/', (req, res) => {
    res.send('ok')
})

expressApp.get('/healthcheck', (req, res) => {
    res.send('ok')
})

const port = process.env.PORT || 3000;

expressApp.listen(port, '0.0.0.0');
