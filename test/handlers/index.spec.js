const fs = require("node:fs/promises");
const path = require("node:path");

const setupWebhookHandlers = require("../../src/handlers");

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
                name: expect.any(String),
            });

            // the handler function returns a function for the octokit webhook middleware to run
            const handlerFunction = handlerObject.handler({ logger: fakeLogger });

            expect(handlerFunction).toEqual(expect.any(Function));
        }
    });

    describe("handler registration", () => {
        let fakeApp;

        beforeEach(() => {
            fakeApp = {
                webhooks: {
                    on: jest.fn(),
                    onError: jest.fn(),
                },
            };
        });

        it("should register one webhook for every handler within the handlers directory", async () => {
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            const files = await fs.readdir(path.join(__dirname, "..", "..", "src", "handlers"));

            await setupWebhookHandlers(fakeApp, fakeLogger);

            expect(fakeApp.webhooks.on).toHaveBeenCalledTimes(files.length - 1);
        });
    });
});
