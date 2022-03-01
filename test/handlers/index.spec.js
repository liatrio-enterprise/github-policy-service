const fs = require("node:fs/promises");
const path = require("node:path");

describe("handlers", () => {
    it("should ensure that each handler follows the correct data structure", async () => {
        const handlerDirectory = path.resolve(path.join(__dirname, "../../src/handlers"));

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const handlerFiles = await fs.readdir(handlerDirectory);

        for (const handlerFile of handlerFiles) {
            if (handlerFile === "index.js") {
                continue;
            }

            // eslint-disable-next-line security/detect-non-literal-require
            const handlerObject = require(path.resolve(handlerDirectory, handlerFile));

            expect(handlerObject).toEqual({
                events: expect.any(Array),
                handler: expect.any(Function),
            });

            // the handler function returns a function for the octokit webhook middleware to run
            const handlerFunction = handlerObject.handler({logger: fakeLogger});

            expect(handlerFunction).toEqual(expect.any(Function));
        }
    });
});
