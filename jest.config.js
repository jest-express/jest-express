module.exports = {
  "globals": {
    "ts-jest": {
      "tsConfigFile": "tsconfig.json"
    }
  },
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "testEnvironment": "node",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  "testMatch": [
    "<rootDir>/test/**/*.(test|spec).(ts|tsx|js)"
  ],
  coveragePathIgnorePatterns: ["<rootDir>/test/helpers/", "<rootDir>/node_modules/"],
  "clearMocks": true
};
