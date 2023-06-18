import {
  SlashCommandBuilder,
  Interaction,
  GuildMember,
  TextBasedChannel,
} from "discord.js";
import { CAHError } from "../../server/model/cahresponse.js";
import { playerJoinGame } from "../../server/manager/gamePlayerManager.js";
import {
  checkCanSendDM,
  executeDefaultTextCommandServerRequest,
} from "../util/util.js";
import axios from "axios";
import config from "../config.json" assert { type: "json" };

export default {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Joins the ongoing game in this channel")
    .setDMPermission(false),
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    await checkCanSendDM(interaction);
    await executeDefaultTextCommandServerRequest(
      interaction,
      config.apiEndpoint + "/bot/game/join",
      true
    );
  },
};
