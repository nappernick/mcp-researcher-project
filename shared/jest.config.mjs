export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  transformIgnorePatterns: [
    "node_modules/(?!variables/.*)"
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  }
}; 