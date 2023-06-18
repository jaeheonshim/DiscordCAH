import {
  BaseInteraction,
  ButtonInteraction,
  Events,
  GuildMember,
  ModalSubmitInteraction,
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

export default {
  name: Events.InteractionCreate,
  async execute(interaction: BaseInteraction) {
    if (!interaction.isModalSubmit()) return;
    const customId = (interaction as ModalSubmitInteraction).customId;

    const transaction = Sentry.startTransaction({
      name: `modal:${customId}`,
    });

    Sentry.setUser({
      id: interaction.user.id,
      username: interaction.user.username,
    });

    try {
      if (customId === "contactModal") {
        const feedback = interaction.fields.getTextInputValue("feedbackInput");

        const feedbackEmbed = {
          title: "User Feedback",
          author: {
            name:
              interaction.user.username + "#" + interaction.user.discriminator,
            icon_url: interaction.user.avatarURL(),
          },
          fields: [
            {
              name: "User ID",
              value: interaction.user.id,
            },
            {
              name: "Feedback Content",
              value: feedback,
            },
          ],
          timestamp: new Date().toISOString(),
        };

        await sendMessageToChannel(interaction.client, config.feedbackChannel, {
          embeds: [feedbackEmbed],
        });
        await interaction.reply({
          content: "Your feedback was received successfully! ",
          ephemeral: true,
        });
      }
    } catch (e) {
      console.error(
        "A modal submit error occurred. Error has been reported to sentry."
      );
      Sentry.captureException(e);
    } finally {
      transaction.finish();
    }
  },
};
