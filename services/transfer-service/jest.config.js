// jest.config.js
// Tells Jest how to run our tests

module.exports = {
  // Run this file before any test suite loads
  setupFiles: ['./jest.setup.js'],

  // Only look for test files inside src/
  testMatch: ['**/src/**/*.test.js'],

  // Show individual test results in the terminal
  verbose: true,

  // Collect coverage from these files
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js', // entry point
  ],
};
