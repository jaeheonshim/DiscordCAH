import { SlashCommandBuilder, Interaction, GuildMember } from "discord.js";
import { CAHError } from "../../server/model/cahresponse.js";
import { playerJoinGame } from "../../server/manager/gamePlayerManager.js";
import {
  checkCanSendDM,
  executeDefaultTextCommandServerRequest,
} from "../util/util.js";
import axios from "axios";
import config from "../config.json" assert { type: "json" };

export default {
  data: new SlashCommandBuilder()
    .setName("decks")
    .setDescription("List all decks available to use in-game"),
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;
    await executeDefaultTextCommandServerRequest(
      interaction,
      config.apiEndpoint + "/bot/decks/list",
      true
    );
  },
};
