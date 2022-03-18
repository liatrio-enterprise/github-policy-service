const branchProtectionHandler = require("../../src/handlers/branch-protection");

describe("branch protection", () => {
    let expectedOwner,
        expectedRepo,
        expectedBranch,
        expectedPayload,
        handler;

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

        handler = branchProtectionHandler.handler({ logger: fakeLogger });
    });

    it("should update branch protection rules when repositories are created, or when branch protection rules are changed", () => {
        expect(branchProtectionHandler.events).toEqual([
            "repository.created",
            "branch_protection_rule.created",
            "branch_protection_rule.edited",
            "branch_protection_rule.deleted",
            "create",
        ]);
    });

    it("should enable branch protection when the appropriate event is received", async () => {
        await handler({
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
            // eslint-disable-next-line unicorn/no-null -- This has to be null so the attribute exists within the request payload that is sent to GitHub
            restrictions: null,
        });
    });

    describe("when a bot is responsible for emitting the event", () => {
        beforeEach(() => {
            expectedPayload.sender.type = "Bot";
        });

        it("should not respond to the event", async () => {
            await handler({
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
            await expect(() => handler({
                octokit: fakeOctokit,
                payload: expectedPayload,
            })).rejects.toThrow(expectedError);
        });
    });
});
