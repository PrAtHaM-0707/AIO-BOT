const { SlashCommandBuilder } = require('discord.js');
const { userPreferencesCollection } = require('../../mongodb'); // Adjust the path to point to mongodb.js

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trackingstatus')
        .setDescription('Check if you have opted out of message tracking.'),
    async execute(interaction) {
        // Check if the user is the bot owner (ID: 1095038359480574102)
        if (interaction.user.id !== '1095038359480574102') {
            return await interaction.reply({
                content: '❌ You do not have permission to use this command. This is an owner-only command.',
                ephemeral: true // Makes the reply visible only to the user
            });
        }

        const userId = interaction.user.id;

        // Check the user's opt-out status
        const userPreference = await userPreferencesCollection.findOne({ userId: userId });
        const isOptedOut = userPreference?.optedOut || false;

        // Reply to the user
        if (isOptedOut) {
            await interaction.reply('You are currently **opted out** of message tracking.');
        } else {
            await interaction.reply('You are currently **opted in** to message tracking.');
        }
    },
};
