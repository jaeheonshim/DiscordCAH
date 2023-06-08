import {
  Interaction,
  SlashCommandBuilder
} from "discord.js";
import {
  executeDefaultTextCommandServerRequest
} from "../util";

export default {
  data: new SlashCommandBuilder()
    .setName("submit")
    .setDescription("Submit a card")
    .addIntegerOption(option => 
      option.setName("number").setDescription("Number of the card you would like to submit").setMinValue(1).setRequired(true)
    )
    .setDMPermission(true),
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    await executeDefaultTextCommandServerRequest(
      interaction,
      "http://localhost:8080/bot/game/submit",
      {
        index: interaction.options.getInteger("number", true) - 1
      }
    );
  },
};
