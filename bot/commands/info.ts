import { SlashCommandBuilder, Interaction, GuildMember } from "discord.js";
import { CAHError } from "../../game/model/cahresponse";
import { playerJoinGame } from "../../game/manager/gamePlayerManager";
import { checkCanSendDM } from "../util";
import axios from "axios";

export default {
    data: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Returns information about the game in this channel"),
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;
        await interaction.deferReply();

        await axios
            .post("http://localhost:8080/bot/game/info", {
                userId: interaction.user.id,
                username: (interaction.member as GuildMember).nickname,
                channelId: interaction.channelId
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
