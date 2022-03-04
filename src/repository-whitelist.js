const config = require("./config")();

let whitelistedRepositories;

module.exports = async (octokit, logger) => {
    if (!config.whitelistedRepositoriesListLocation) {
        return [];
    }

    if (whitelistedRepositories?.expiration > Date.now()) {
        logger.debug({
            whitelist: whitelistedRepositories.repositories,
        }, "Returning cached repository whitelist");

        return whitelistedRepositories.repositories;
    }

    logger.debug("Fetching repository whitelist");

    const response = await octokit.request(
        "GET /repos/{owner}/{repo}/contents/{path}",
        config.whitelistedRepositoriesListLocation,
    );
    const repositories = JSON.parse(Buffer.from(response.data.content, "base64").toString("utf8"));

    whitelistedRepositories = {
        repositories,
        expiration: Date.now() + (1000 * 60 * 5), // 5 minutes in the future
    };

    logger.debug({
        whitelist: whitelistedRepositories.repositories,
    }, "Returning new repository whitelist");

    return repositories;
};
