module.exports = {
  setupFilesAfterEnv: [
    "<rootDir>/test/setup.ts"
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "/test/.*\\.spec\\.tsx?$",
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx"
  ]
}
