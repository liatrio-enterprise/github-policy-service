const config = require("./config")();

let whitelistedRepositories;

module.exports = async (octokit) => {
    if (!config.whitelistedRepositoriesListLocation) {
        return [];
    }

    if (whitelistedRepositories?.expiration > Date.now()) {
        return whitelistedRepositories.repositories;
    }

    const response = await octokit.request(
        "GET /repos/{owner}/{repo}/contents/{path}",
        config.whitelistedRepositoriesListLocation,
    );
    const repositories = JSON.parse(Buffer.from(response.data.content, "base64").toString("utf8"));

    whitelistedRepositories = {
        repositories,
        expiration: Date.now() + (1000 * 60 * 5), // 5 minutes in the future
    };

    return repositories;
};
