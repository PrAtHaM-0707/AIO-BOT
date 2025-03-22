const { SlashCommandBuilder } = require('discord.js');
const { userPreferencesCollection } = require('../../mongodb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('optin')
        .setDescription('Allow a user to have their messages tracked again.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to opt in to message tracking.')
                .setRequired(true)
        ),
    async execute(interaction) {
        // Check if the user is the bot owner (ID: 1095038359480574102)
        if (interaction.user.id !== '1095038359480574102') {
            return await interaction.reply({
                content: '❌ You do not have permission to use this command. This is an owner-only command.',
                ephemeral: true
            });
        }

        // Get the user to opt in
        const targetUser = interaction.options.getUser('user');
        const userId = targetUser.id;

        // Save the user's opt-in preference in the database
        await userPreferencesCollection.updateOne(
            { userId: userId },
            { $set: { optedOut: false } },
            { upsert: true }
        );

        // Reply to the owner
        await interaction.reply(`✅ ${targetUser.tag} has been opted in to message tracking.`);
    },
};
