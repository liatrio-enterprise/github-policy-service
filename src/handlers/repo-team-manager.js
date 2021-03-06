module.exports = {
    name: "teamManager",
    events: [
        "repository.created",
        "repository.edited",
        "repository.renamed",
        "repository.transferred",
        "repository.unarchived",
    ],
    handler: ({ logger }) => async ({ octokit, payload }) => {
        const repoName = payload.repository.name;
        if (!repoName.includes(".")) {
            logger.info("No team name found in repo name.");

            return;
        }

        const [teamSlug] = repoName.split(".");
        const teamResponse = await octokit.request(
            "GET /orgs/{org}/teams/{teamSlug}",
            {
                org: payload.repository.owner.login,
                teamSlug,
            },
        );

        await octokit.request(
            "PUT /orgs/{org}/teams/{teamSlug}/repos/{owner}/{repo}",
            {
                org: payload.repository.owner.login,
                teamSlug: teamResponse.data.slug,
                owner: payload.repository.owner.login,
                permission: "maintain",
                repo: repoName,
            },
        );
    },
};
