describe("config", () => {
    let config,
        oldProcessEnvironment;

    beforeAll(() => {
        oldProcessEnvironment = process.env;
    });

    afterAll(() => {
        process.env = oldProcessEnvironment;
    });

    beforeEach(() => {
        jest.isolateModules(() => {
            config = require("../src/config");
        });
    });

    // there isn't really a good way to test this outright.
    // the best strategy is to invoke this like normal, then update an environment variable such that the code
    // path would throw an error if the config wasn't cached.
    it("should return the cached value when invoked multiple times", () => {
        process.env.GITHUB_REPOSITORY_WHITELIST_LOCATION = "foo/bar/baz";

        config();

        process.env.GITHUB_REPOSITORY_WHITELIST_LOCATION = "foo";

        config();
    });

    describe("github repository whitelist location", () => {
        let expectedOwner,
            expectedRepo,
            expectedPath;

        beforeEach(() => {
            expectedOwner = chance.word();
            expectedRepo = chance.word();
            expectedPath = chance.word();

            process.env.GITHUB_REPOSITORY_WHITELIST_LOCATION = `${expectedOwner}/${expectedRepo}/${expectedPath}`;
        });

        it("should parse the github repository whitelist location", () => {
            const actualConfig = config();

            expect(actualConfig.whitelistedRepositoriesListLocation).toEqual({
                owner: expectedOwner,
                repo: expectedRepo,
                path: expectedPath,
            });
        });

        describe("when the environment variable does not follow the expected pattern", () => {
            beforeEach(() => {
                process.env.GITHUB_REPOSITORY_WHITELIST_LOCATION = chance.word();
            });

            it("should throw an error", () => {
                expect(config).toThrow("expected GITHUB_REPOSITORY_WHITELIST_LOCATION environment variable to follow the pattern ORG/REPO/PATH_TO_JSON_FILE");
            });
        });
    });
});
