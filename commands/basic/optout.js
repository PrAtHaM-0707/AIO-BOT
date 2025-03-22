const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { userPreferencesCollection } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('optout')
        .setDescription('Stop the bot from tracking your messages.'),
    async execute(interaction) {
        if (!interaction.isCommand()) {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: "Alert!",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/optout`')
                .setTimestamp();
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;

        try {
            await userPreferencesCollection.updateOne(
                { userId: userId },
                { $set: { optedOut: true } },
                { upsert: true }
            );

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: "Tracking Preference Updated",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setDescription(`✅ You have opted out of message tracking. The bot will no longer track your messages.`)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error in /optout for user ${userId}:`, error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: "Error",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setDescription('❌ An error occurred while updating your tracking preference. Please try again later.')
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
