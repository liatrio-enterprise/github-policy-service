const BATCH_SIZE = 5;

const setBranchProtectionForAllRepositories = async (logger, octokit, organization, config) => {
    const allRepositories = await octokit.paginate("GET /orgs/{organization}/repos", {
        organization,
    });

    const repositories = allRepositories.filter((repository) => !config.repositoryWhitelist.includes(repository.name));

    for (let index = 0; index < repositories.length; index += BATCH_SIZE) {
        const batchRepositories = repositories.slice(index, index + BATCH_SIZE);
        const batchRepositoryNames = repositories.map((repository) => repository.name);

        logger.debug({
            repositories: batchRepositoryNames,
        }, "Enabling branch protection for repository batch");

        // eslint-disable-next-line no-await-in-loop
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
