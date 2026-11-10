const { Client, GatewayIntentBits, Events } = require('discord.js');
const { config, validateEnvironment } = require('./config');
const { connectDatabase, pool } = require('./db');
const { registerCommands } = require('./register-commands');
const { pingCommand } = require('./commands/ping');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands = new Map([[pingCommand.data.name, pingCommand]]);
let shutdownStarted = false;

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Bot ready! Logged in as ${readyClient.user.tag}.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing /${interaction.commandName}: ${error.message}`);
    const reply = { content: 'An error occurred while executing this command.', ephemeral: true };
    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    } catch (replyError) {
      console.error(`Failed to send command error response: ${replyError.message}`);
    }
  }
});

client.on(Events.Error, (error) => {
  console.error(`Discord client error: ${error.message}`);
});

// discord.js manages gateway reconnection; do not call login() again on disconnect.
client.on('shardDisconnect', (_event, shardId) => {
  console.warn(`Discord shard ${shardId} disconnected; waiting for discord.js to reconnect.`);
});
client.on('shardReconnecting', (shardId) => {
  console.info(`Discord shard ${shardId} is reconnecting.`);
});
client.on('shardResume', (shardId, replayedEvents) => {
  console.info(`Discord shard ${shardId} resumed (${replayedEvents} events replayed).`);
});

async function startBot() {
  validateEnvironment();
  await registerCommands();
  await connectDatabase();
  // Only one initial login is made. Gateway reconnects are handled by discord.js.
  await client.login(config.discordToken);
}

async function shutdown(signal) {
  if (shutdownStarted) return;
  shutdownStarted = true;
  console.log(`Received ${signal}; shutting down.`);
  client.destroy();
  try {
    await pool.end();
  } catch (error) {
    console.error(`Error closing PostgreSQL pool: ${error.message}`);
    process.exitCode = 1;
  }
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exitCode = 1;
});
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

if (require.main === module) {
  startBot().catch((error) => {
    console.error(`Bot startup failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { startBot, shutdown };
