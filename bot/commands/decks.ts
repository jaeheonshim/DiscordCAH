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
    .setDescription("List all decks available to use in-game")
    .addStringOption((option) => 
      option
        .setName("deckid")
        .setRequired(false)
        .setDescription("The ID of the deck you'd like to see more information about. Leave empty to list all decks.")
    ),
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const deckId = interaction.options.getString("deckid", false);

    if(deckId === null) {
      await executeDefaultTextCommandServerRequest(
        interaction,
        config.apiEndpoint + "/bot/decks/list",
        true
      );
    } else {
      await executeDefaultTextCommandServerRequest(
        interaction,
        config.apiEndpoint + "/bot/decks/get/" + deckId,
        true
      );
    }
  },
};
