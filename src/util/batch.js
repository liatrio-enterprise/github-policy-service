const BATCH_SIZE = 5;

const setBranchProtectionForAllRepositories = async (logger, octokit, organization, config) => {
    const repositories = await octokit.paginate("GET /orgs/{organization}/repos", {
        organization,
    });

    const validRepositories = repositories.filter((repository) => !config.repositoryWhitelist.includes(repository.name));

    for (let i = 0; i < validRepositories.length; i += BATCH_SIZE) {
        const batchRepositories = validRepositories.slice(i, i + BATCH_SIZE);
        const batchRepositoryNames = validRepositories.map((repository) => repository.name);

        logger.debug({
            repositories: batchRepositoryNames,
        }, "Enabling branch protection for repository batch")

        await Promise.all(batchRepositories.map((repository) => octokit.request(
            "PUT /repos/{owner}/{repo}/branches/{branch}/protection",
            {
                owner: repository.owner.login,
                repo: repository.name,
                branch: repository.default_branch,
                ...config.branchProtection,
            },
        )));
    }
};

module.exports = {
    setBranchProtectionForAllRepositories,
};
