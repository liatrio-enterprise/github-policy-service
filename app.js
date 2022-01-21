const { App, createNodeMiddleware } = require("@octokit/app");
require('dotenv').config()

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

(async () => {
    const { data } = await app.octokit.request("/app")
    .catch(reason => {
        console.log(reason);
    })
    console.log("authenticated as %s", data.name);
})()


