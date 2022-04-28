const BATCH_SIZE = 5;

const setBranchProtectionForAllRepositories = async (logger, octokit, organization, config) => {
    const allRepositories = await octokit.paginate("GET /orgs/{organization}/repos", {
        organization,
    });

    const repositories = allRepositories.filter((repository) => !config.repositoryWhitelist.includes(repository.name));

    for (let i = 0; i < repositories.length; i += BATCH_SIZE) {
        const batchRepositories = repositories.slice(i, i + BATCH_SIZE);
        const batchRepositoryNames = batchRepositories.map((repository) => repository.name);

        logger.debug({
            repositories: batchRepositoryNames,
        }, "Enabling branch protection for repository batch");

        // eslint-disable-next-line no-await-in-loop
        const results = await Promise.allSettled(batchRepositories.map((repository) => octokit.request(
            "PUT /repos/{owner}/{repo}/branches/{branch}/protection",
            {
                owner: repository.owner.login,
                repo: repository.name,
                branch: repository.default_branch,
                ...config.branchProtection,
            },
        )));

        logger.debug({
            results
        }, "Results for branch protection")
    }
};

module.exports = {
    setBranchProtectionForAllRepositories,
};
