describe("config", () => {
    let config,
        expectedOrganization;

    beforeEach(() => {
        jest.isolateModules(() => {
            config = require("../../src/config/index");
        });

        expectedOrganization = chance.word();
    });

    it("should make a request for the github policy service config file", async () => {
        await config.getConfigForOrg(fakeLogger, fakeOctokit, expectedOrganization);

        expect(fakeOctokit.request).toHaveBeenCalledOnce();
        expect(fakeOctokit.request).toHaveBeenCalledWith("GET /repos/{owner}/{repo}/contents/{path}", {
            owner: expectedOrganization,
            repo: ".github",
            path: "github-policy-service.json",
        });
    });

    describe("given the config has been cached", () => {
        beforeEach(async () => {
            await config.getConfigForOrg(fakeLogger, fakeOctokit, expectedOrganization);

            fakeOctokit.request.mockReset();
        });

        it("should return the cached results instead of making a new request", async () => {
            await config.getConfigForOrg(fakeLogger, fakeOctokit, expectedOrganization);

            expect(fakeOctokit.request).not.toHaveBeenCalled();
        });
    });
});
