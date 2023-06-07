import { SlashCommandBuilder, Interaction, GuildMember } from "discord.js";
import { CAHError } from "../../server/model/cahresponse";
import { playerJoinGame } from "../../server/manager/gamePlayerManager";
import {
  checkCanSendDM,
  executeDefaultTextCommandServerRequest,
} from "../util";
import axios from "axios";

export default {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Returns information about the game in this channel")
    .setDMPermission(false),
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;
    await executeDefaultTextCommandServerRequest(
      interaction,
      "http://localhost:8080/bot/game/info"
    );
  },
};
