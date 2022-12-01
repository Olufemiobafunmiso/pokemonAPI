export default {
  transform: {
    '\\.[jt]sx?$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.spec.{js,ts}',
    '!src/server.ts',
    '!src/config/*.ts',
  ],
  testEnvironment: 'node',
  testRegex: './(tests?|src)/.*\\.(test|spec)?\\.(js|ts)$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
