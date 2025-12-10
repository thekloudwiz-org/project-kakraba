module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.test.ts',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 35,
      statements: 35
    }
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true
};
