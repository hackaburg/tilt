module.exports = {
  setupFilesAfterEnv: [
    "<rootDir>/test/setup.ts"
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "/test/.*\\.spec\\.tsx?$",
  moduleNameMapper: {
    // mock api module. the "$" ensures the react tests won't fail, as enzyme
    // apparently relies on an "*api*" module, which would be resolved to
    // the mocked api client module
    "api$": "<rootDir>/test/__mocks__/api.ts",
  },
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx"
  ]
}
