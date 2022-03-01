const fs = require("node:fs/promises");
const path = require("node:path");

module.exports = async (app, logger) => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const files = await fs.readdir(__dirname);

    await Promise.all(files.map(async (file) => {
        if (file === "index.js") {
            return undefined;
        }

        // eslint-disable-next-line security/detect-non-literal-require
        const { events, handler } = require(path.join(__dirname, file));
        const handlerName = path.parse(file).name;

        return app.webhooks.on(events, handler({
            logger: logger.child({
                handler: handlerName,
            }),
        }));
    }));
};
