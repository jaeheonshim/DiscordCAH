import { SlashCommandBuilder, Interaction, GuildMember } from "discord.js";
import { CAHError } from "../../game/model/cahresponse";
import { playerJoinGame } from "../../game/manager/gamePlayerManager";
import { checkCanSendDM, executeDefaultTextCommandServerRequest } from "../util";
import axios from "axios";

export default {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName("new")
        .setDescription("Creates a new game in this channel"),
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;
        await executeDefaultTextCommandServerRequest(interaction, "http://localhost:8080/bot/game/new");
    },
};
