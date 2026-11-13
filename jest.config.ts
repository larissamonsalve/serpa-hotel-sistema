import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Aponta para a raiz da aplicação Next.js para carregar o next.config.ts e o .env
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'node',
  // Mapeia o atalho @/ para que o Jest encontre as pastas (services, repositories, etc.)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default createJestConfig(config);