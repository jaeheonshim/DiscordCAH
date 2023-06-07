import { BaseInteraction, ButtonInteraction, Events } from "discord.js";
import { executeDefaultTextCommandServerRequest } from "../util";

export default {
    name: Events.InteractionCreate,
    async execute(interaction: BaseInteraction) {
        if (interaction.isButton()) {
            const customId = (interaction as ButtonInteraction).customId;

            try {
                switch (customId) {
                    case "JOIN": {
                        await executeDefaultTextCommandServerRequest(interaction, "http://localhost:8080/bot/game/join");
                    }
                }
            } catch(e) {
                console.error(e);
            }
		}
    },
};