import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.jest.json'
    }
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/__tests__/**'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov']
};

export default config;
