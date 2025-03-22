const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { userPreferencesCollection } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trackingstatus')
        .setDescription('Check if your messages are being tracked by the bot.'),
    async execute(interaction) {
        if (!interaction.isCommand()) {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: "Alert!",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/trackingstatus`')
                .setTimestamp();
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;

        try {
            const userPreference = await userPreferencesCollection.findOne({ userId: userId });
            const isOptedOut = userPreference?.optedOut || false;

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: "Tracking Status",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setDescription(`You are currently **${isOptedOut ? 'opted out' : 'opted in'}** of message tracking.`)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(`Error in /trackingstatus for user ${userId}:`, error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: "Error",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setDescription('❌ An error occurred while checking your tracking status. Please try again later.')
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
