module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/database/migrations/**', '!src/database/seeds/**'],
  testPathIgnorePatterns: ['/node_modules/'],
  verbose: true
};
