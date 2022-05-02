const fs = require("node:fs/promises");
const path = require("node:path");

const { getConfigForOrg } = require("../config");

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

        return app.webhooks.on(events, async (handlerArguments) => {
            const { octokit, payload } = handlerArguments;
            const organization = payload.repository.owner.login;
            const repository = payload.repository.name;
            const config = await getConfigForOrg(logger, octokit, organization);

            if (!config.repositoryWhitelist.includes(repository) || handlerName === "config-reload") {
                await handler({
                    logger: logger.child({
                        name: handlerName,
                    }),
                    config,
                })(handlerArguments);
            } else {
                logger.debug({
                    organization,
                    repository,
                }, "Ignoring event for repository as it is whitelisted");
            }
        });
    }));

    app.webhooks.onError((error) => {
        logger.error({ error });
    });
};
