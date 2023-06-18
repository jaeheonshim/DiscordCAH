import {
  BaseInteraction,
  ButtonInteraction,
  Events,
  GuildMember,
  TextBasedChannel,
} from "discord.js";
import {
  executeDefaultTextCommandServerRequest,
  scheduleRoundBegin,
} from "../util/util.js";
import axios from "axios";
import { scheduleJob } from "node-schedule";
import * as Sentry from "@sentry/node";
import {
  sendMessageToChannel,
  sendMessageToUser,
} from "../util/shardMessaging.js";
import config from "../config.json" assert { type: "json" };
import { creatingAGame, endingTheGame, gameplay, joiningAGame, startingTheGame } from "../util/helpEmbeds.js";

export default {
  name: Events.InteractionCreate,
  async execute(interaction: BaseInteraction) {
    if (interaction.isButton()) {
      const customId = (interaction as ButtonInteraction).customId;

      const transaction = Sentry.startTransaction({
        name: `button:${customId}`,
      });

      Sentry.setUser({
        id: interaction.user.id,
        username: interaction.user.username,
      });

      try {
        if (customId.startsWith("SUBMIT")) {
          await handleSubmit(interaction);
          return;
        }

        switch (customId) {
          case "JOIN": {
            await executeDefaultTextCommandServerRequest(
              interaction,
              config.apiEndpoint + "/bot/game/join",
              true
            );
            break;
          }
          case "BEGIN": {
            await interaction.deferReply();
            await axios
              .post(config.apiEndpoint + "/bot/game/ready", {
                userId: interaction.user.id,
                username:
                  (interaction.member as GuildMember).nickname ||
                  interaction.user.username,
                channelId: interaction.channelId,
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
            break;
          }
          case "help:gameplay": {
            interaction.reply({
              ephemeral: true,
              embeds: [creatingAGame, joiningAGame, startingTheGame, gameplay, endingTheGame]
            });
            break;
          }
        }
      } catch (e) {
        console.error(
          "A button command error occurred. Error has been reported to sentry."
        );
        Sentry.captureException(e);
      } finally {
        transaction.finish();
      }
    }
  },
};

async function handleSubmit(interaction: ButtonInteraction) {
  const data = await executeDefaultTextCommandServerRequest(
    interaction,
    config.apiEndpoint + "/bot/game/submit",
    false,
    {
      index: parseInt(interaction.customId.split(":")[1]),
    }
  );

  if (data.allSubmitted) {
    await axios
      .post(config.apiEndpoint + "/bot/game/beginJudging", {
        gameId: data.gameId,
      })
      .then(async (res) => {
        if (!res.data.channelMessage) return;
        const channelMessage = res.data.channelMessage;

        await sendMessageToChannel(
          interaction.client,
          channelMessage.channelId,
          channelMessage.message
        );

        const individualMessages = res.data.individualMessages;
        for (const userId of Object.keys(individualMessages)) {
          const message = individualMessages[userId];
          await sendMessageToUser(interaction.client, userId, message);
        }
      });
  }
}
