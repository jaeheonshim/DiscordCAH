import {
    SlashCommandBuilder,
    Interaction,
    GuildMember,
    TextBasedChannel,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} from "discord.js";
import { CAHError } from "../../server/model/cahresponse";
import { playerJoinGame } from "../../server/manager/gamePlayerManager";
import {
    checkCanSendDM,
    executeDefaultTextCommandServerRequest,
} from "../util";
import axios from "axios";

export default {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName("new")
        .setDescription("Creates a new game in this channel")
        .setDMPermission(false),
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        await interaction.deferReply();
        await checkCanSendDM(interaction);

        await axios
            .post("http://localhost:8080/bot/game/new", {
                userId: interaction.user.id,
                username:
                    (interaction.member as GuildMember).nickname ||
                    interaction.user.username,
                channelId: interaction.channelId,
                channelName: interaction.channel.name,
                serverName: interaction.guild.name,
                displayAvatarURL: interaction.user.displayAvatarURL(),
            })
            .then(async (res) => {
                if (res.data) {
                    const newGameMessage = res.data.response[0];

                    // Only add buttons if game was successfully created
                    if(res.data.gameId) {
                        const joinButton = new ButtonBuilder()
                            .setCustomId("JOIN")
                            .setLabel("Join Game")
                            .setStyle(ButtonStyle.Primary);

                        const startButton = new ButtonBuilder()
                            .setCustomId("START")
                            .setLabel("Start Game")
                            .setStyle(ButtonStyle.Success);

                        const row = new ActionRowBuilder()
                            .addComponents(joinButton, startButton);

                        newGameMessage.components = [row];
                    }

                    await interaction.followUp(newGameMessage);
                }
            });
    },
};
