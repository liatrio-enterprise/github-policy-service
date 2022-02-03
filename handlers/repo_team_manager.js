module.exports = async function ({ octokit, payload }) {
    const repo_name = payload.repository.name;
    if (!repo_name.includes(".")) {
        return;
    }

    const repo_name_parse = repo_name.split('.');
    const team_slug = repo_name_parse[0];

    const team_response = await octokit.request(
        "GET /orgs/{org}/teams/{team_slug}",
        {
            org: payload.repository.owner.login,
            team_slug: team_slug
        }
    );
    
    if (team_response?.status !== 200) {
        return;
    }
    
    await octokit.request(
        "PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}",
        {
            org: payload.repository.owner.login,
            team_slug: team_response.data.slug,
            owner: payload.repository.owner.login,
            permission: "maintain",
            repo: repo_name
        }
    );
}