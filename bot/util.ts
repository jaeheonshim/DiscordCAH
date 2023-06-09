import {
  BaseGuildTextChannel,
  BaseInteraction,
  Client,
  GuildMember,
  Interaction,
  TextBasedChannel,
  User,
} from "discord.js";
import { CAHError } from "../server/model/cahresponse.js";
import axios from "axios";
import { scheduleJob } from "node-schedule";
import * as Sentry from "@sentry/node";
import { sendMessageToChannel, sendMessageToUser } from "./shardMessaging.js";

const checkDMCooldown = new Map<string, number>();
const DM_RECHECK_COOLDOWN = 60 * 60 * 1000; // recheck DM permissions after 60 minutes

export async function checkCanSendDM(interaction) {
  const cooldown = checkDMCooldown.get(interaction.user.id);
  if (cooldown && Date.now() - cooldown < DM_RECHECK_COOLDOWN) return;

  try {
    await interaction.user.send({
      embeds: [
        {
          title: "Test Message",
          color: 0x00ff00,
          description:
            "This is a test message to validate that you can receive messages from our bot. If you can see this message, you passed the test!\n\nIf other members of your game aren't seeing this message, tell them to enable server DMs (Server Name -> Privacy Settings -> Direct Messages).\n\n**Don't disable server DMs, or the bot won't work correctly!**",
        },
      ],
    });
    checkDMCooldown.set(interaction.user.id, Date.now());
  } catch (error) {
    throw new CAHError(
      "Couldn't send direct messages to this user - make sure you've allowed server members to send you direct messages!"
    );
  }
}

export async function executeDefaultTextCommandServerRequest(
  interaction,
  endpoint,
  ephemeral = false,
  body = {}
) {
  await interaction.deferReply({ ephemeral: ephemeral });

  return await axios
    .post(endpoint, {
      ...body,
      userId: interaction.user.id,
      username: (interaction.member && (interaction.member as GuildMember).nickname) || interaction.user.username,
      channelId: interaction.channelId,
      displayAvatarURL: interaction.user.displayAvatarURL(),
    })
    .then(async (res) => {
      if (res.data) {
        for (const response of res.data.response) {
          await interaction.followUp(response);
        }

        if (res.data.channelMessage) {
          const channelId = res.data.channelMessage.channelId;
          const message = res.data.channelMessage.message;

          await sendMessageToChannel(interaction.client, channelId, message);
        }

        if(res.data.individualMessages) {
          const individualMessages = res.data.individualMessages;
          for (const userId of Object.keys(individualMessages)) {
            const message = individualMessages[userId];
            await sendMessageToUser(interaction.client, userId, message);
          }
        }
      }

      return res.data;
    });
}

export async function beginJudging(client: Client, gameId, validRoundNumber?) {
  await axios.post("http://localhost:8080/bot/game/beginJudging", { gameId, validRoundNumber }).then(async res => {
    if (!res.data.channelMessage) return;
    const channelMessage = res.data.channelMessage;

    await sendMessageToChannel(client, channelMessage.channelId, channelMessage.message);

    const individualMessages = res.data.individualMessages;
    if (individualMessages) {
      for (const userId of Object.keys(individualMessages)) {
        const message = individualMessages[userId];
        await sendMessageToUser(client, userId, message);
      }
    }
  });
}

export function scheduleRoundBegin(client: Client, time, gameId) {
  scheduleJob(time, async () => {
    try {
      await axios.post("http://localhost:8080/bot/game/newRound", { gameId }).then(async res => {
        if (!res.data.channelMessage) return;
        const channelMessage = res.data.channelMessage;

        await sendMessageToChannel(client, channelMessage.channelId, channelMessage.message);

        const individualMessages = res.data.individualMessages;
        for (const userId of Object.keys(individualMessages)) {
          const message = individualMessages[userId];
          await sendMessageToUser(client, userId, message);
        }

        const judgeBeginTime = res.data.judgeBeginTime;
        scheduleJob(judgeBeginTime, async () => {
          await beginJudging(client, gameId);
        });
      });
    } catch (e) {
      // game likely ended before round began
      console.error("A scheduled event error occurred. Error has been reported to sentry.");
      Sentry.captureException(e);
    }
  });
}