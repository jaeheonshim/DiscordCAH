import { BaseInteraction, ButtonInteraction, Events, GuildMember, TextBasedChannel } from "discord.js";
import { executeDefaultTextCommandServerRequest, scheduleRoundBegin } from "../util";
import axios from "axios";
import { scheduleJob } from "node-schedule";

export default {
    name: Events.InteractionCreate,
    async execute(interaction: BaseInteraction) {
        if (interaction.isButton()) {
            const customId = (interaction as ButtonInteraction).customId;

            try {
                if(customId.startsWith("SUBMIT")) {
                    await handleSubmit(interaction);
                    return;
                }

                switch (customId) {
                    case "JOIN": {
                        await executeDefaultTextCommandServerRequest(interaction, "http://localhost:8080/bot/game/join");
                        break;
                    }
                    case "BEGIN": {
                        await interaction.deferReply();
                        await axios
                            .post("http://localhost:8080/bot/game/ready", {
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
                                        scheduleRoundBegin(interaction.client, res.data.gameBeginTime, res.data.gameId);
                                    }
                                }
                            });
                        break;
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }
    },
};

async function handleSubmit(interaction: ButtonInteraction) {
    const data = await executeDefaultTextCommandServerRequest(
        interaction,
        "http://localhost:8080/bot/game/submit",
        {
            index: parseInt(interaction.customId.split(":")[1])
        }
    );

    if (data.allSubmitted) {
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
                    }).catch(e => { });
                }
            });
        } catch (e) {
            console.error(e);
        }
    }
}