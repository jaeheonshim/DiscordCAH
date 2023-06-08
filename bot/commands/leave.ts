import {
  Interaction,
  SlashCommandBuilder
} from "discord.js";
import {
  executeDefaultTextCommandServerRequest, scheduleRoundBegin
} from "../util";

export default {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave the game you're currently in"),
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const data = await executeDefaultTextCommandServerRequest(
      interaction,
      "http://localhost:8080/bot/game/leave",
      true
    );

    if(data.gameId) {
      scheduleRoundBegin(interaction.client, data.nextRoundBeginTime, data.gameId);
    }
  },
};
