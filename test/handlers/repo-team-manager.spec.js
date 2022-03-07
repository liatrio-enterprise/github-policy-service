const repoTeamManagerHandler = require("../../src/handlers/repo-team-manager");

describe("repo team manager", () => {
    let expectedOwner,
        expectedRepo,
        expectedRepoName,
        expectedTeam,
        expectedTeamSlug,
        expectedPayload,
        handler;

    beforeEach(() => {
        expectedOwner = chance.word();
        expectedTeam = chance.word();
        expectedRepoName = chance.word();
        expectedRepo = `${expectedTeam}.${expectedRepoName}`;
        expectedTeamSlug = chance.word();

        expectedPayload = {
            repository: {
                name: expectedRepo,
                owner: {
                    login: expectedOwner,
                },
            },
        };

        fakeOctokit.request.mockResolvedValue();

        when(fakeOctokit.request).calledWith("GET /orgs/{org}/teams/{teamSlug}", {
            org: expectedOwner,
            teamSlug: expectedTeam,
        }).mockResolvedValue({
            data: {
                slug: expectedTeamSlug,
            },
        });

        handler = repoTeamManagerHandler.handler({ logger: fakeLogger });
    });

    it("should update a repository's teams when a repository is created, edited, renamed, transferred, or unarchived", () => {
        expect(repoTeamManagerHandler.events).toEqual([
            "repository.created",
            "repository.edited",
            "repository.renamed",
            "repository.transferred",
            "repository.unarchived",
        ]);
    });

    it("should assign the specified team to the newly created repository", async () => {
        await handler({
            octokit: fakeOctokit,
            payload: expectedPayload,
        });

        expect(fakeOctokit.request).toHaveBeenCalledWith("GET /orgs/{org}/teams/{teamSlug}", {
            org: expectedOwner,
            teamSlug: expectedTeam,
        });

        expect(fakeOctokit.request).toHaveBeenCalledWith(
            "PUT /orgs/{org}/teams/{teamSlug}/repos/{owner}/{repo}",
            {
                org: expectedOwner,
                teamSlug: expectedTeamSlug,
                owner: expectedOwner,
                permission: "maintain",
                repo: expectedRepo,
            },
        );
    });

    describe("when the new repository doesn't contain a team prefix", () => {
        beforeEach(() => {
            expectedPayload.repository.name = expectedRepoName;
        });

        it("should not respond to the event", async () => {
            await handler({
                octokit: fakeOctokit,
                payload: expectedPayload,
            });

            expect(fakeOctokit.request).not.toHaveBeenCalled();
        });
    });

    describe("when an error is encountered while managing a repository's teams", () => {
        let expectedError;

        beforeEach(() => {
            expectedError = new Error(chance.word());

            fakeOctokit.request.mockRejectedValue(expectedError);
        });

        it("should log the error and bubble it up to the GitHub webhook middleware", async () => {
            await expect(() => handler({
                octokit: fakeOctokit,
                payload: expectedPayload,
            })).rejects.toThrow(expectedError);
        });
    });
});
