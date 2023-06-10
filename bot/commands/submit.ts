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
import { sendMessageToChannel } from "../shardMessaging.js";
import config from "../config.json" assert {type: "json"};

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
      config.apiEndpoint + "/bot/game/submit",
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
          axios.post(config.apiEndpoint + "/bot/game/endRound", { gameId: data.gameId }).then(async (res) => {
            const data = res.data;
            if(!data.channelMessage) return;
            
            const channelId = data.channelMessage.channelId;
            const message = data.channelMessage.message;
  
            await sendMessageToChannel(interaction.client, channelId, message);

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
