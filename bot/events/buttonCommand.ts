import { BaseInteraction, ButtonInteraction, Events, GuildMember } from "discord.js";
import { executeDefaultTextCommandServerRequest, scheduleRoundBegin } from "../util";
import axios from "axios";

export default {
    name: Events.InteractionCreate,
    async execute(interaction: BaseInteraction) {
        if (interaction.isButton()) {
            const customId = (interaction as ButtonInteraction).customId;

            try {
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