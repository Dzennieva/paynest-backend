module.exports = {
  setupFiles: ['./jest.setup.js'],
  testMatch: ['**/src/**/*.test.js'],
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
  ],
};
