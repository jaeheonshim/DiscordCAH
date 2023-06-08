import {
  Interaction,
  SlashCommandBuilder
} from "discord.js";
import {
  executeDefaultTextCommandServerRequest
} from "../util";

export default {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave the game you're currently in")
    .setDMPermission(false),
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    await executeDefaultTextCommandServerRequest(
      interaction,
      "http://localhost:8080/bot/game/leave",
      true
    );
  },
};
