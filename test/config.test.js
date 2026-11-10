const test = require('node:test');
const assert = require('node:assert/strict');
const { validateEnvironment } = require('../src/config');

const validEnvironment = {
  DISCORD_TOKEN: 'test-token',
  DISCORD_CLIENT_ID: '123456789012345678',
  POSTGRES_HOST: 'localhost',
  POSTGRES_PORT: '5432',
  POSTGRES_DATABASE: 'exiverse',
  POSTGRES_USER: 'bot',
  POSTGRES_PASSWORD: 'test-password'
};

test('accepts valid Discord and PostgreSQL environment variables', () => {
  assert.doesNotThrow(() => validateEnvironment(validEnvironment));
});

test('accepts DATABASE_URL without separate PostgreSQL credentials', () => {
  const env = {
    DISCORD_TOKEN: 'test-token',
    DISCORD_CLIENT_ID: '123456789012345678',
    DATABASE_URL: 'postgresql://bot:password@localhost:5432/exiverse'
  };
  assert.doesNotThrow(() => validateEnvironment(env));
});

test('reports missing required environment variables', () => {
  assert.throws(
    () => validateEnvironment({}),
    /DISCORD_TOKEN is required.*DISCORD_CLIENT_ID is required/s
  );
});

test('rejects an invalid PostgreSQL port', () => {
  const env = { ...validEnvironment, POSTGRES_PORT: 'not-a-port' };
  assert.throws(() => validateEnvironment(env), /POSTGRES_PORT must be an integer/);
});
