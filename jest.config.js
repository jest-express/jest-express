module.exports = {
  globals: {
    'ts-jest': {
      isolatedModules: true,
      tsConfig: 'tsconfig.json',
    },
  },
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/test/**/*.(test|spec).(ts|tsx|js)',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/test/helpers/',
    '<rootDir>/node_modules/',
  ],
  clearMocks: true,
  preset: 'ts-jest',
}