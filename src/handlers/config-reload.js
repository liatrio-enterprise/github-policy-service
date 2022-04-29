const { refreshConfigForOrg } = require("../config");
const { setBranchProtectionForAllRepositories } = require("../util/batch");

module.exports = {
    name: "configReload",
    events: [
        "push",
    ],
    handler: ({ logger }) => async ({ octokit, payload }) => {
        const mainBranchReference = `refs/heads/${payload.repository.default_branch}`;
        const organization = payload.repository.owner.login;

        if (payload.repository.name === ".github" && payload.ref === mainBranchReference) {
            const refreshedConfig = await refreshConfigForOrg(logger, octokit, organization);

            await setBranchProtectionForAllRepositories(logger, octokit, organization, refreshedConfig);
        }
    },
};
