const fs = require("node:fs/promises");
const path = require("node:path");

const getWhitelistedRepositories = require("../repository-whitelist");

module.exports = async (app, logger) => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const files = await fs.readdir(__dirname);

    await Promise.all(files.map(async (file) => {
        if (file === "index.js") {
            return undefined;
        }

        // eslint-disable-next-line security/detect-non-literal-require
        const { events, handler } = require(path.join(__dirname, file));
        const handlerName = path.parse(file).name;

        return app.webhooks.on(events, async (handlerArgs) => {
            const { octokit, payload } = handlerArgs;
            const whitelistedRepositories = await getWhitelistedRepositories(octokit, logger.child({
                name: "repository-whitelist"
            }));

            if (!whitelistedRepositories.includes(payload.repository.name)) {
                await handler({
                    logger: logger.child({
                        name: handlerName,
                    }),
                })(handlerArgs);
            }
        });
    }));

    app.webhooks.onError((error) => {
        logger.error({ error });
    });
};
