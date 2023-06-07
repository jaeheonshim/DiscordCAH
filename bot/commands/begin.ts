import {
  Client,
  GuildMember,
  Interaction,
  SlashCommandBuilder,
  TextBasedChannel
} from "discord.js";
import {
  executeDefaultTextCommandServerRequest
} from "../util";
import axios from "axios";
import { scheduleJob } from "node-schedule";
import { retrieveGameByChannelId } from "../../server/manager/gameStorageManager";

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
      .post("http://localhost:8080/bot/game/ready", {
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
            scheduleRoundBegin(interaction.client, res.data.gameBeginTime, res.data.gameId, res.data.channelId);
          }
        }
      });
  },
};

function scheduleRoundBegin(client: Client, time, gameId, channelId) {
  scheduleJob(time, async () => {
    try {
      await axios.post("http://localhost:8080/bot/game/newRound", { gameId }).then(async res => {
        if (!res.data.channelMessage) return;
        const channelMessage = res.data.channelMessage;

        const channel = (await client.channels.fetch(channelId) as TextBasedChannel);
        await channel.send(channelMessage);

        const individualMessages = res.data.individualMessages;
        for (const userId of Object.keys(individualMessages)) {
          const message = individualMessages[userId];
          client.users.fetch(userId).then(async user => {
            await user.send(message);
          }).catch(e => {});
        }
      });
    } catch (e) {
      // game likely ended before round began
      console.error(e);
    }
  });
}