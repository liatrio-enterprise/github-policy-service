const { App, createNodeMiddleware } = require("@octokit/app");
const express = require("express");
const fs = require("node:fs");

const pino = require("pino");
const expressLogger = require("express-pino-logger");

const setupWebhookHandlers = require("./handlers");

const getLogger = () => {
    const pinoOptions = {
        serializers: {
            err: pino.stdSerializers.err,
            error: pino.stdSerializers.err,
        },
    };

    if (process.env.NODE_ENV === "local") {
        // eslint-disable-next-line node/no-unpublished-require -- While pino-pretty is only a devDependency, we're only loading it when running locally, so this is alright
        const pretty = require("pino-pretty");

        return pino({
            ...pinoOptions,
            level: "debug",
        }, pretty({
            colorize: true,
        }));
    }

    return pino(pinoOptions);
};

const logger = getLogger();

const expressApp = express();

expressApp.use(express.json());
expressApp.use(expressLogger({
    logger,
}));

require("dotenv").config();

const getAppPrivateKey = () => {
    if (process.env.GITHUB_APP_PRIVATE_KEY) {
        return process.env.GITHUB_APP_PRIVATE_KEY;
    }

    if (process.env.GITHUB_APP_PRIVATE_KEY_PATH) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- This is fine as long as the environment variable is configured correctly
        return fs.readFileSync(process.env.GITHUB_APP_PRIVATE_KEY_PATH).toString();
    }

    return undefined;
};

const app = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey: getAppPrivateKey(),
    oauth: {
        clientId: process.env.GITHUB_APP_CLIENT_ID,
        clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
    },
    webhooks: {
        secret: process.env.WEBHOOK_SECRET,
    },
});

(async () => {
    await setupWebhookHandlers(app, logger);

    expressApp.use(createNodeMiddleware(app));

    expressApp.get("/", (request, response) => {
        response.send("ok");
    });

    expressApp.get("/healthcheck", (request, response) => {
        response.send("ok");
    });

    const port = process.env.PORT || 3000;
    expressApp.listen(port, "0.0.0.0", () => {
        logger.info(`Application listening on port ${port}`);
    });
})();
