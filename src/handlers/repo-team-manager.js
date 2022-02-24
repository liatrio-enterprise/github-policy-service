module.exports = (logger) => async ({ octokit, payload }) => {
    const repoName = payload.repository.name;
    if (!repoName.includes(".")) {
        logger.info("No team name found in repo name.");

        return;
    }

    const teamSlug = repoName.split(".")[0];

    const teamResponse = await octokit.request(
        "GET /orgs/{org}/teams/{teamSlug}",
        {
            org: payload.repository.owner.login,
            teamSlug,
        },
    ).catch((error) => {
        logger.info(error);
    });

    if (teamResponse?.status !== 200) {
        logger.info(`Team response: ${teamResponse?.status}`);

        return;
    }

    await octokit.request(
        "PUT /orgs/{org}/teams/{teamSlug}/repos/{owner}/{repo}",
        {
            org: payload.repository.owner.login,
            teamSlug: teamResponse.data.slug,
            owner: payload.repository.owner.login,
            permission: "maintain",
            repo: repoName,
        },
    ).catch((error) => {
        logger.error(error);
    });
};
