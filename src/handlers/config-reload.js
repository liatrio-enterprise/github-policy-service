const { refreshConfigForOrg } = require("../config");
const { setBranchProtectionForAllRepositories } = require("../util/batch");

module.exports = {
    name: "configReload",
    events: [
        "push",
    ],
    handler: ({ logger, config }) => async ({ octokit, payload }) => {
        if (payload.repository.name === ".github" && payload.ref === `refs/heads/${payload.repository.default_branch}`) {
            await refreshConfigForOrg(logger, octokit, payload.repository.owner.login);

            await setBranchProtectionForAllRepositories(logger, octokit, payload.repository.owner.login, config);
        }
    },
};
