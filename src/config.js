require('dotenv').config();

function validateEnvironment(env = process.env) {
  const errors = [];
  const required = ['DISCORD_TOKEN', 'DISCORD_CLIENT_ID'];

  for (const name of required) {
    if (typeof env[name] !== 'string' || env[name].trim() === '') {
      errors.push(`${name} is required.`);
    }
  }

  const hasDatabaseUrl = typeof env.DATABASE_URL === 'string' && env.DATABASE_URL.trim() !== '';
  if (!hasDatabaseUrl) {
    for (const name of ['POSTGRES_HOST', 'POSTGRES_DATABASE', 'POSTGRES_USER', 'POSTGRES_PASSWORD']) {
      if (typeof env[name] !== 'string' || env[name].trim() === '') {
        errors.push(`${name} is required when DATABASE_URL is not set.`);
      }
    }
    const port = Number(env.POSTGRES_PORT || 5432);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      errors.push('POSTGRES_PORT must be an integer between 1 and 65535.');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment configuration:\n- ${errors.join('\n- ')}`);
  }
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  discordToken: process.env.DISCORD_TOKEN || '',
  discordClientId: process.env.DISCORD_CLIENT_ID || '',
  discordGuildId: process.env.DISCORD_GUILD_ID || '',
  databaseUrl: process.env.DATABASE_URL || '',
  postgres: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DATABASE || 'exiverse',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    ssl: process.env.POSTGRES_SSL === 'true'
  }
};

module.exports = { config, validateEnvironment };
