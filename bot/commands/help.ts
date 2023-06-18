import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  MessageActionRowComponentBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { mainHelpEmbed } from "../util/helpEmbeds.js";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Learn how to use the bot"),
  async execute(interaction: BaseInteraction) {
    if (!interaction.isChatInputCommand()) return;

    const gameplay = new ButtonBuilder()
      .setCustomId("help:gameplay")
      .setLabel("How to Play")
      .setStyle(ButtonStyle.Primary);

    const invite = new ButtonBuilder()
      .setURL("https://discord.gg/invite/7VEcQJf")
      .setLabel("Join Support Server")
      .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(gameplay, invite);

    interaction.reply({
      ephemeral: true,
      embeds: [mainHelpEmbed],
      components: [row]
    });
  },
};
