const Chance = require("chance");
const { when } = require("jest-when");
const matchers = require("jest-extended");

expect.extend(matchers);

global.chance = new Chance();
global.when = when;

global.fakeLogger = {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
};

global.fakeOctokit = {
    request: jest.fn(),
};
