const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { userPreferencesCollection } = require('../../mongodb');
const cmdIcons = require('../../UI/icons/commandicons');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listoptedout')
        .setDescription('List all users who are opted out of message tracking.'),
    async execute(interaction) {
        if (!interaction.isCommand()) {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: "Alert!",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setDescription('- This command can only be used through slash command!\n- Please use `/listoptedout`')
                .setTimestamp();
            return await interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        // Keep the owner-only restriction
        if (interaction.user.id !== '1095038359480574102') {
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setAuthor({
                    name: "Permission Denied",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setDescription('❌ You do not have permission to use this command. This is an owner-only command.')
                .setTimestamp();
            return await interaction.editReply({ embeds: [embed] });
        }

        try {
            const optedOutUsers = await userPreferencesCollection.find({ optedOut: true }).toArray();

            if (optedOutUsers.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setAuthor({
                        name: "Opted-Out Users",
                        iconURL: cmdIcons.dotIcon,
                        url: "https://discord.gg/xQF9f9yUEM"
                    })
                    .setDescription('No users are currently opted out of message tracking.')
                    .setTimestamp();
                return await interaction.editReply({ embeds: [embed] });
            }

            const usersPerPage = 10;
            const pages = [];
            const userList = await Promise.all(
                optedOutUsers.map(async (entry) => {
                    try {
                        const user = await interaction.client.users.fetch(entry.userId);
                        return `- ${user.tag} (ID: ${entry.userId})`;
                    } catch (error) {
                        return `- Unknown User (ID: ${entry.userId})`;
                    }
                })
            );

            for (let i = 0; i < userList.length; i += usersPerPage) {
                const pageUsers = userList.slice(i, i + usersPerPage);
                pages.push({
                    title: 'Opted-Out Users',
                    description: `**Total Users:** ${optedOutUsers.length}\n\n${pageUsers.join('\n')}`,
                });
            }

            let currentPage = 0;

            const createEmbed = () => {
                const page = pages[currentPage];
                return new EmbedBuilder()
                    .setColor('#3498db')
                    .setAuthor({
                        name: page.title,
                        iconURL: cmdIcons.dotIcon,
                        url: "https://discord.gg/xQF9f9yUEM"
                    })
                    .setDescription(page.description)
                    .setFooter({ text: `Page ${currentPage + 1} of ${pages.length}` })
                    .setTimestamp();
            };

            const createComponents = () => {
                return new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('Back')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === pages.length - 1)
                );
            };

            const reply = await interaction.editReply({
                embeds: [createEmbed()],
                components: [createComponents()],
                fetchReply: true
            });

            const collector = reply.createMessageComponentCollector({ time: 120000 });

            collector.on('collect', async (i) => {
                if (i.user.id !== interaction.user.id) return;

                if (i.customId === 'previous') {
                    currentPage = Math.max(0, currentPage - 1);
                } else if (i.customId === 'next') {
                    currentPage = Math.min(pages.length - 1, currentPage + 1);
                }

                await i.update({
                    embeds: [createEmbed()],
                    components: [createComponents()]
                });
            });

            collector.on('end', () => {
                interaction.editReply({ components: [] }).catch(() => {});
            });
        } catch (error) {
            console.error('Error in /listoptedout:', error);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setAuthor({
                    name: "Error",
                    iconURL: cmdIcons.dotIcon,
                    url: "https://discord.gg/xQF9f9yUEM"
                })
                .setDescription('❌ An error occurred while fetching the list of opted-out users. Please try again later.')
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    },
};
