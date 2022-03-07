const config = require("./config")();

let whitelistedRepositories;

const getRepositoryWhitelist = async (octokit, logger) => {
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

const parseRepository = (repository) => {
    const parts = repository.split("/");

    if (parts.length === 2) {
        return {
            owner: parts[0],
            repo: parts[1],
        };
    }

    // if the repo doesn't have an organization prefix, assume it's the org where the whitelist exists
    return {
        owner: config.whitelistedRepositoriesListLocation.owner,
        repo: repository,
    };
};

const repositoryIsWhitelisted = async (octokit, logger, payload) => {
    const repositoryWhitelist = await getRepositoryWhitelist(octokit, logger);

    for (const repository of repositoryWhitelist) {
        const parsedRepository = parseRepository(repository);

        if (
            payload.repository.owner.login === parsedRepository.owner &&
            payload.repository.name === parsedRepository.repo
        ) {
            return true;
        }
    }

    return false;
};

module.exports = repositoryIsWhitelisted;
