module.exports = async function({ octokit, payload }) {
    const repo_name = payload.repository.name;

    const teams = await octokit.request(
        "GET /orgs/{org}/teams",
        {
            org: payload.repository.owner.login
        }
    )
    console.log(teams);

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

    //potential problems
    /*
        - how do we want to manage being able to change team repo permissions (if at all)
        - do we want something like "platform" to be added to both a "platfor" and "platform" team? or just the team specified in name?
    */
}