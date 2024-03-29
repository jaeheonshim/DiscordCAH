import {
  SlashCommandBuilder,
  Interaction,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { executeDefaultTextCommandServerRequest } from "../util/util.js";
import config from "../config.json" assert { type: "json" };

export default {
  data: new SlashCommandBuilder()
    .setName("end")
    .setDescription("End the current ongoing game in this channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;
    await executeDefaultTextCommandServerRequest(
      interaction,
      config.apiEndpoint + "/bot/game/end"
    );
  },
};
