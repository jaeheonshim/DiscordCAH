import {
  Client,
  GuildMember,
  Interaction,
  SlashCommandBuilder,
  TextBasedChannel,
} from "discord.js";
import {
  executeDefaultTextCommandServerRequest,
  scheduleRoundBegin,
} from "../util/util.js";
import axios from "axios";
import { scheduleJob } from "node-schedule";
import { retrieveGameByChannelId } from "../../server/manager/gameStorageManager.js";
import config from "../config.json" assert { type: "json" };

export default {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("begin")
    .setDescription("Get ready to begin the game you're currently in")
    .setDMPermission(false),
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    await interaction.deferReply();

    await axios
      .post(config.apiEndpoint + "/bot/game/ready", {
        userId: interaction.user.id,
        username:
          (interaction.member as GuildMember).nickname ||
          interaction.user.username,
        channelId: interaction.channelId,
        channelName: interaction.channel.name,
        serverName: interaction.guild.name,
        displayAvatarURL: interaction.user.displayAvatarURL(),
      })
      .then(async (res) => {
        if (res.data) {
          for (const response of res.data.response) {
            await interaction.followUp(response);
          }

          if (res.data.gameBeginTime) {
            scheduleRoundBegin(
              interaction.client,
              res.data.gameBeginTime,
              res.data.gameId
            );
          }
        }
      });
  },
};
