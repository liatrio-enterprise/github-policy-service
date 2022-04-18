const defaultConfig = require("./default");

const config = {};

const getExpirationDateInMinutes = (minutes) => Date.now() + (1000 * 60 * minutes);

const getConfigForOrg = async (logger, octokit, organization) => {
    if (config[organization]?.expiration > Date.now()) {
        logger.debug({
            config: config[organization],
        }, "Returning cached repository config");

        return config[organization].config;
    }

    await refreshConfigForOrg(logger, octokit, organization);

    return config[organization].config;
};

const refreshConfigForOrg = async (logger, octokit, organization) => {
    logger.debug({ organization }, "Refreshing config for organization");

    try {
        const response = await octokit.request(
            "GET /repos/{owner}/{repo}/contents/{path}",
            {
                owner: organization,
                repo: ".github",
                path: "github-policy-service.json",
            },
        );

        const json = JSON.parse(Buffer.from(response.data.content, "base64").toString("utf8"));

        config[organization] = {
            config: {
                ...defaultConfig,
                ...json,
            },
            expiration: getExpirationDateInMinutes(15),
        };
    } catch (error) {
        logger.error({ error,
            organization }, "Error refreshing config for organization, using default config");

        config[organization] = {
            config: defaultConfig,
            expiration: getExpirationDateInMinutes(15),
        };
    }
};

module.exports = {
    getConfigForOrg,
};
