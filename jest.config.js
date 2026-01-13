module.exports = {
  preset: "@vue/cli-plugin-unit-jest",
  testMatch: ["**/tests/unit/**/*.spec.[jt]s?(x)"],
  collectCoverageFrom: [
    "src/core/services/store/**/*.js",
    "src/view/components/**/*.vue",
    "!src/**/*.d.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: ["/node_modules/(?!vuetify)"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
};
