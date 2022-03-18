const fs = require("node:fs/promises");
const path = require("node:path");

const repositoryIsWhitelisted = require("../repository-whitelist");

module.exports = async (app, logger) => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- We're always going to be reading the same directory that this index.js file exists within
    const files = await fs.readdir(__dirname);

    await Promise.all(files.map(async (file) => {
        if (file === "index.js") {
            return undefined;
        }

        // eslint-disable-next-line security/detect-non-literal-require -- We will only be loading files within this `handlers` directory
        const { events, handler } = require(path.join(__dirname, file));
        const handlerName = path.parse(file).name;

        return app.webhooks.on(events, async (handlerArguments) => {
            const { octokit, payload } = handlerArguments;

            if (!await repositoryIsWhitelisted(octokit, logger, payload)) {
                await handler({
                    logger: logger.child({
                        name: handlerName,
                    }),
                })(handlerArguments);
            }
        });
    }));

    app.webhooks.onError((error) => {
        logger.error({ error });
    });
};
