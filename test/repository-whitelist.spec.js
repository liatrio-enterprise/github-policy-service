jest.mock("../src/config");

const config = require("../src/config");

const createBase64EncodedRepositoryList = (repositories) => Buffer.from(JSON.stringify(repositories)).toString("base64");

describe("repository whitelist", () => {
    let whitelistLocationOwner,
        whitelistLocationRepo,
        whitelistLocationPath,
        whitelistedRepositoryName,
        whitelistedRepositoryOwner,
        expectedPayload,
        repositoryIsWhitelisted;

    beforeEach(() => {
        // this is needed because this module implements its own cache. by isolating this module, the cache is
        // cleared before running a new test.
        jest.isolateModules(() => {
            repositoryIsWhitelisted = require("../src/repository-whitelist");
        });

        whitelistLocationOwner = chance.word();
        whitelistLocationRepo = chance.word();
        whitelistLocationPath = chance.word();
        whitelistedRepositoryName = chance.word();
        whitelistedRepositoryOwner = chance.word();

        expectedPayload = {
            repository: {
                name: whitelistedRepositoryName,
                owner: {
                    login: whitelistedRepositoryOwner,
                },
            },
        };

        config.mockReturnValue({
            whitelistedRepositoriesListLocation: {
                owner: whitelistLocationOwner,
                repo: whitelistLocationRepo,
                path: whitelistLocationPath,
            },
        });

        when(fakeOctokit.request).calledWith("GET /repos/{owner}/{repo}/contents/{path}", {
            owner: whitelistLocationOwner,
            repo: whitelistLocationRepo,
            path: whitelistLocationPath,
        }).mockResolvedValue({
            data: {
                content: createBase64EncodedRepositoryList([`${whitelistedRepositoryOwner}/${whitelistedRepositoryName}`]),
            },
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should return true if the given repository is in the whitelist", async () => {
        const result = await repositoryIsWhitelisted(fakeOctokit, fakeLogger, expectedPayload);

        expect(result).toBeTrue();
    });

    it("should return false if the given repository is not in the whitelist", async () => {
        expectedPayload.repository.name = chance.word();

        const result = await repositoryIsWhitelisted(fakeOctokit, fakeLogger, expectedPayload);

        expect(result).toBeFalse();
    });

    it("should pull from the cache when multiple whitelist checks occur within five minutes", async () => {
        await repositoryIsWhitelisted(fakeOctokit, fakeLogger, expectedPayload);
        await repositoryIsWhitelisted(fakeOctokit, fakeLogger, expectedPayload);

        expect(fakeOctokit.request).toHaveBeenCalledOnce();
    });

    it("should invalidate the cache after five minutes", async () => {
        jest.useFakeTimers();
        await repositoryIsWhitelisted(fakeOctokit, fakeLogger, expectedPayload);

        jest.advanceTimersByTime((1000 * 60 * 5) + 1);
        await repositoryIsWhitelisted(fakeOctokit, fakeLogger, expectedPayload);

        expect(fakeOctokit.request).toHaveBeenCalledTimes(2);
    });

    describe("when the whitelisted repository is not in org/repo format", () => {
        beforeEach(() => {
            when(fakeOctokit.request).calledWith("GET /repos/{owner}/{repo}/contents/{path}", {
                owner: whitelistLocationOwner,
                repo: whitelistLocationRepo,
                path: whitelistLocationPath,
            }).mockResolvedValue({
                data: {
                    content: createBase64EncodedRepositoryList([whitelistedRepositoryName]),
                },
            });
        });

        it("should return true when the given repository is in the same org as the whitelist", async () => {
            expectedPayload.repository.owner.login = whitelistLocationOwner;

            const result = await repositoryIsWhitelisted(fakeOctokit, fakeLogger, expectedPayload);

            expect(result).toBeTrue();
        });
    });

    describe("when the repository whitelist is not configured", () => {
        beforeEach(() => {
            config.mockReturnValue({});
        });

        it("should always return false, since there is no whitelist", async () => {
            expectedPayload.repository.name = chance.word();
            expectedPayload.repository.owner.login = chance.word();

            const result = await repositoryIsWhitelisted(fakeOctokit, fakeLogger, expectedPayload);

            expect(result).toBeFalse();
        });
    });
});
