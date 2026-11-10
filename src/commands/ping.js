const { SlashCommandBuilder } = require('discord.js');

const pingCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot response and WebSocket latency.'),

  async execute(interaction) {
    const startedAt = Date.now();
    await interaction.reply({ content: 'Pinging...' });
    const responseLatency = Date.now() - startedAt;
    const websocketLatency = interaction.client.ws.ping;

    await interaction.editReply(
      `🏓 Pong! Response: ${responseLatency}ms | WebSocket: ${websocketLatency}ms`
    );
  }
};

module.exports = { pingCommand };
