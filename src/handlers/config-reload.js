const { refreshConfigForOrg } = require("../config");
const { setBranchProtectionForAllRepositories } = require("../util/batch");

module.exports = {
    name: "configReload",
    events: [
        "push",
    ],
    handler: ({ logger }) => async ({ octokit, payload }) => {
        const mainBranchReference = `refs/heads/${payload.repository.default_branch}`;

        if (payload.repository.name === ".github" && payload.ref === mainBranchReference) {
            const refreshedConfig = await refreshConfigForOrg(logger, octokit, payload.repository.owner.login);

            await setBranchProtectionForAllRepositories(logger, octokit, payload.repository.owner.login, refreshedConfig);
        }
    },
};
