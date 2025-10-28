require('dotenv').config({ path: '.env.test' });

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts', '**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__tests__/setup.ts',
    '/__tests__/helpers/',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // FIX 5: Handle .js imports in TypeScript files
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // FIX 1: Remove deprecated globals configuration
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        isolatedModules: true,
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
        },
      },
    ],
  },

  // FIX 2: Run tests serially to avoid worker serialization issues
  maxWorkers: 1,

  // FIX 3: Increase test timeout for WebSocket tests
  testTimeout: 30000, // 30 seconds

  // FIX 4: Setup file for test environment
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/index.ts'],

  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
