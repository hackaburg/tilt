module.exports = {
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  testRegex: "/test/.*\\.spec\\.ts$",
  moduleFileExtensions: ["ts", "js"],
};
