import {
  Interaction,
  SlashCommandBuilder,
  TextBasedChannel
} from "discord.js";
import {
  beginJudging,
  executeDefaultTextCommandServerRequest, scheduleRoundBegin
} from "../util.js";
import axios from "axios";
import { scheduleJob } from "node-schedule";
import { CAHError } from "../../server/model/cahresponse.js";
import * as Sentry from "@sentry/node";

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
    if(!interaction.channel.isDMBased()) throw new CAHError("This command can only be executed in a direct message channel.");

    const data = await executeDefaultTextCommandServerRequest(
      interaction,
      "http://localhost:8080/bot/game/submit",
      false,
      {
        index: interaction.options.getInteger("number", true) - 1
      }
    );

    if(data.allSubmitted) {
      await beginJudging(interaction.client, data.gameId);
    } else if(data.resultDisplayTime) {
      scheduleJob(data.resultDisplayTime, async () => {
        try {
          axios.post("http://localhost:8080/bot/game/endRound", { gameId: data.gameId }).then(async (res) => {
            const data = res.data;
            const channelId = data.channelMessage.channelId;
            const message = data.channelMessage.message;
  
            const channel = (await interaction.client.channels.fetch(channelId)) as TextBasedChannel;
            await channel.send(message);

            const nextRoundBeginTime = data.roundBeginTime;
            scheduleRoundBegin(interaction.client, nextRoundBeginTime, data.gameId);
          });
        } catch(e) {
          console.error("A scheduler error occurred (endpoint: endRound). Error has been reported to sentry.");
          Sentry.captureException(e);
        }
      });
    }
  },
};
