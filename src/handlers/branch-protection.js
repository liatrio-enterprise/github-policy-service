module.exports = {
    name: "branchProtection",
    events: [
        "repository.created",
        "branch_protection_rule.created",
        "branch_protection_rule.edited",
        "branch_protection_rule.deleted",
        "create",
    ],
    handler: ({ logger, config }) => async ({ octokit, payload }) => {
        if (payload.sender.type !== "Bot") {
            logger.info("Enabling branch protection");

            await octokit.request(
                "PUT /repos/{owner}/{repo}/branches/{branch}/protection",
                {
                    owner: payload.repository.owner.login,
                    repo: payload.repository.name,
                    branch: payload.repository.default_branch,
                    ...config.branchProtection,
                },
            );
        }
    },
};
