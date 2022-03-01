const branchProtectionHandler = require("../../src/handlers/branch-protection")(fakeLogger);

describe("branch protection", () => {
    let expectedOwner,
        expectedRepo,
        expectedBranch,
        expectedPayload;

    beforeEach(() => {
        expectedOwner = chance.word();
        expectedRepo = chance.word();
        expectedBranch = chance.word();

        expectedPayload = {
            repository: {
                default_branch: expectedBranch,
                name: expectedRepo,
                owner: {
                    login: expectedOwner,
                },
            },
            sender: {},
        };

        fakeOctokit.request.mockResolvedValue();
    });

    it("should enable branch protection when the appropriate event is received", async () => {
        await branchProtectionHandler({
            octokit: fakeOctokit,
            payload: expectedPayload,
        });

        expect(fakeOctokit.request).toHaveBeenCalledWith("PUT /repos/{owner}/{repo}/branches/{branch}/protection", {
            owner: expectedOwner,
            repo: expectedRepo,
            branch: expectedBranch,
            required_status_checks: {
                contexts: [],
                strict: true,
            },
            enforce_admins: true,
            required_pull_request_reviews: {
                dismiss_stale_reviews: true,
                required_approving_review_count: 1,
            },
            required_linear_history: true,
            allow_force_pushes: false,
            allow_deletions: false,
            required_conversation_resolution: true,
            // null is specifically needed here. if this is undefined, the property isn't added to the JSON payload, and
            // GitHub rejects the request
            restrictions: null, // eslint-disable-line unicorn/no-null
        });
    });

    describe("when a bot is responsible for emitting the event", () => {
        beforeEach(() => {
            expectedPayload.sender.type = "Bot";
        });

        it("should not respond to the event", async () => {
            await branchProtectionHandler({
                octokit: fakeOctokit,
                payload: expectedPayload,
            });

            expect(fakeOctokit.request).not.toHaveBeenCalled();
        });
    });

    describe("when enabling branch protection throws an error", () => {
        let expectedError;

        beforeEach(() => {
            expectedError = new Error(chance.word());

            fakeOctokit.request.mockRejectedValue(expectedError);
        });

        it("should log the error and bubble it up to the GitHub webhook middleware", async () => {
            await expect(() => branchProtectionHandler({
                octokit: fakeOctokit,
                payload: expectedPayload,
            })).rejects.toThrow(expectedError);
        });
    });
});
