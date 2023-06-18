import { Interaction, SlashCommandBuilder } from "discord.js";
import {
  executeDefaultTextCommandServerRequest,
  scheduleRoundBegin,
} from "../util/util.js";
import config from "../config.json" assert { type: "json" };

export default {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave the game you're currently in"),
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    const data = await executeDefaultTextCommandServerRequest(
      interaction,
      config.apiEndpoint + "/bot/game/leave",
      true
    );

    if (data.gameId) {
      scheduleRoundBegin(
        interaction.client,
        data.nextRoundBeginTime,
        data.gameId
      );
    }
  },
};
