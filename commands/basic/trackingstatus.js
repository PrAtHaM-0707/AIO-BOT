const { SlashCommandBuilder } = require('discord.js');
const { userPreferencesCollection } = require('../../mongodb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trackingstatus')
        .setDescription('Check if a user has opted out of message tracking.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to check the tracking status for. Defaults to you.')
                .setRequired(false)
        ),
    async execute(interaction) {
        // Check if the user is the bot owner (ID: 1095038359480574102)
        if (interaction.user.id !== '1095038359480574102') {
            return await interaction.reply({
                content: '❌ You do not have permission to use this command. This is an owner-only command.',
                ephemeral: true
            });
        }

        // Get the user to check (default to the command issuer if no user is specified)
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const userId = targetUser.id;

        // Check the user's opt-out status
        const userPreference = await userPreferencesCollection.findOne({ userId: userId });
        const isOptedOut = userPreference?.optedOut || false;

        // Reply to the owner
        if (isOptedOut) {
            await interaction.reply(`${targetUser.tag} is currently **opted out** of message tracking.`);
        } else {
            await interaction.reply(`${targetUser.tag} is currently **opted in** to message tracking.`);
        }
    },
};
