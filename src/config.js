let config;

module.exports = () => {
    if (config) {
        return config;
    }

    config = {};

    if (process.env.GITHUB_REPOSITORY_WHITELIST_LOCATION) {
        const [owner, repo, ...path] = process.env.GITHUB_REPOSITORY_WHITELIST_LOCATION.split("/");

        if (!owner || !repo || !path || path.length === 0) {
            throw new Error("expected GITHUB_REPOSITORY_WHITELIST_LOCATION environment variable to follow the pattern ORG/REPO/PATH_TO_JSON_FILE");
        }

        config.whitelistedRepositoriesListLocation = {
            owner,
            repo,
            path: path.join("/"),
        };
    }

    return config;
};
