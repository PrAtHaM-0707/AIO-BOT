const { SlashCommandBuilder } = require('discord.js');
const { userPreferencesCollection } = require('../../mongodb'); // Adjust the path to point to mongodb.js

module.exports = {
    data: new SlashCommandBuilder()
        .setName('optin')
        .setDescription('Allow the bot to track your messages again.'),
    async execute(interaction) {
        // Check if the user is the bot owner (ID: 1095038359480574102)
        if (interaction.user.id !== '1095038359480574102') {
            return await interaction.reply({
                content: '❌ You do not have permission to use this command. This is an owner-only command.',
                ephemeral: true // Makes the reply visible only to the user
            });
        }

        const userId = interaction.user.id;

        // Save the user's opt-in preference in the database
        await userPreferencesCollection.updateOne(
            { userId: userId },
            { $set: { optedOut: false } },
            { upsert: true } // Create a new entry if the user doesn't exist
        );

        // Reply to the user
        await interaction.reply('You have opted back in. The bot will now track your messages.');
    },
};
