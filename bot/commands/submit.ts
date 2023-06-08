import {
  Interaction,
  SlashCommandBuilder,
  TextBasedChannel
} from "discord.js";
import {
  executeDefaultTextCommandServerRequest
} from "../util";
import axios from "axios";

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

    const data = await executeDefaultTextCommandServerRequest(
      interaction,
      "http://localhost:8080/bot/game/submit",
      {
        index: interaction.options.getInteger("number", true) - 1
      }
    );

    if(data.allSubmitted) {
      try {
        await axios.post("http://localhost:8080/bot/game/beginJudging", { gameId: data.gameId }).then(async res => {
          if (!res.data.channelMessage) return;
          const channelMessage = res.data.channelMessage;
  
          const channel = (await interaction.client.channels.fetch(channelMessage.channelId) as TextBasedChannel);
          await channel.send(channelMessage.message);
          const individualMessages = res.data.individualMessages;
          for (const userId of Object.keys(individualMessages)) {
            const message = individualMessages[userId];
            interaction.client.users.fetch(userId).then(async user => {
              await user.send(message);
            }).catch(e => {});
          }
        });
      } catch (e) {
        console.error(e);
      }
    }
  },
};
