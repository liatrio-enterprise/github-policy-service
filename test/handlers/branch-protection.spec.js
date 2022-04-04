const branchProtectionHandler = require("../../src/handlers/branch-protection");
const defaultConfig = require("../../src/config/default");

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

        handler = branchProtectionHandler.handler({ logger: fakeLogger, config: defaultConfig });
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

        expect(fakeOctokit.request).toHaveBeenCalledWith("PUT /repos/{owner}/{repo}/branches/{branch}/protection", expect.any(Object));

        // test the actual contents of the object
        const requestObject = fakeOctokit.request.mock.calls[0][1];

        expect(requestObject).toStrictEqual(expect.objectContaining(defaultConfig.branchProtection));
        expect(requestObject).toStrictEqual(expect.objectContaining({
            owner: expectedOwner,
            repo: expectedRepo,
            branch: expectedBranch,
        }));
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
