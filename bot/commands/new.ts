import { SlashCommandBuilder, Interaction, GuildMember } from "discord.js";
import { CAHError } from "../../game/model/cahresponse";
import { playerJoinGame } from "../../game/manager/gamePlayerManager";
import { checkCanSendDM } from "../util";
import axios from "axios";

export default {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName("new")
        .setDescription("Creates a new game in this channel"),
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;
        await interaction.deferReply();

        await axios
            .post("http://localhost:8080/bot/game/new", {
                userId: interaction.user.id,
                username: (interaction.member as GuildMember).nickname,
                channelId: interaction.channelId,
                channelName: interaction.channel.name,
                serverName: interaction.guild.name,
                displayAvatarURL: interaction.user.displayAvatarURL(),
            })
            .then((res) => {
                if (res.data) {
                    for (const response of res.data.response) {
                        interaction.followUp(response);
                    }
                }
            });
    },
};
