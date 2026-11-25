const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const customJestConfig = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    // Quarantined (2026-11-18): writes real ownership rows to whatever DATABASE_URL points at
    // (historically production). Never part of routine runs; explicit opt-in only, and the
    // test itself refuses any non-disposable target.
    ...(process.env.TMI_ALLOW_REAL_DB_PERSISTENCE_TEST === '1' ? [] : ['runStoreItemOwnershipPersistence']),
  ],
};

module.exports = createJestConfig(customJestConfig);
