import {
  ActionRowBuilder,
  Interaction,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import config from "../config.json" assert { type: "json" };
import { executeDefaultTextCommandServerRequest } from "../util/util.js";

export default {
  data: new SlashCommandBuilder()
    .setName("contact")
    .setDescription("Contact the developer"),
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const modal = new ModalBuilder();
    modal.setCustomId("contactModal");
    modal.setTitle("Contact the Developer");

    const textFeedbackInput = new TextInputBuilder()
      .setCustomId("feedbackInput")
      .setLabel("Enter feedback here")
      .setPlaceholder(
        "Enter anything you would like to send to the developer of the bot here."
      )
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const firstActionRow =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        textFeedbackInput
      );
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
  },
};
