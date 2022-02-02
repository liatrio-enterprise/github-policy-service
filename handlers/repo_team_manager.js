module.exports = async function({ octokit, payload }) {
    const repo_name = payload.repository.name;

    const teams = await octokit.request(
        "GET /orgs/{org}/teams",
        {
            org: payload.repository.owner.login
        }
    )

    teams.data.map(async team => {
        if(!repo_name.startsWith(team.slug)) {
            return;
        }

        await octokit.request(
            "PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}",
            {
                org: payload.repository.owner.login,
                team_slug: team.slug,
                owner: payload.repository.owner.login,
                permission: "maintain",
                repo: repo_name
            }
        )
    });
}