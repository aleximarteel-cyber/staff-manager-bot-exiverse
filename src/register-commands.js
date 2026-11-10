const { REST, Routes } = require('discord.js');
const { config, validateEnvironment } = require('./config');
const { pingCommand } = require('./commands/ping');

async function registerCommands() {
  validateEnvironment();
  const rest = new REST({ version: '10' }).setToken(config.discordToken);
  const route = config.discordGuildId
    ? Routes.applicationGuildCommands(config.discordClientId, config.discordGuildId)
    : Routes.applicationCommands(config.discordClientId);

  try {
    await rest.put(route, { body: [pingCommand.data.toJSON()] });
    console.log(config.discordGuildId
      ? 'Slash command registered for the configured server.'
      : 'Slash command registered globally.');
  } catch (error) {
    console.error(`Failed to register slash command: ${error.message}`);
    throw error;
  }
}

if (require.main === module) {
  registerCommands().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { registerCommands };
