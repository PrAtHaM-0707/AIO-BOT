const { SlashCommandBuilder } = require('discord.js');
const { userPreferencesCollection } = require('../../mongodb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('optout')
        .setDescription('Stop a user from having their messages tracked.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to opt out of message tracking.')
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

        // Get the user to opt out
        const targetUser = interaction.options.getUser('user');
        const userId = targetUser.id;

        // Save the user's opt-out preference in the database
        await userPreferencesCollection.updateOne(
            { userId: userId },
            { $set: { optedOut: true } },
            { upsert: true }
        );

        // Reply to the owner
        await interaction.reply(`✅ ${targetUser.tag} has been opted out of message tracking.`);
    },
};
