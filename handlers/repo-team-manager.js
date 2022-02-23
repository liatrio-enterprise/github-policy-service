module.exports = async ({ octokit, payload }) => {
    const repoName = payload.repository.name;
    if (!repoName.includes(".")) {
        console.log("No team name found in repo name.");

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
        console.log(error);
    });

    if (teamResponse?.status !== 200) {
        console.log(`Team response: ${teamResponse?.status}`);

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
        console.log(error);
    });
};
