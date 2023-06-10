import { Collection, Events } from "discord.js";
import { CAHError } from "../../server/model/cahresponse.js";
import * as Sentry from "@sentry/node";

export default {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    const { cooldowns } = interaction.client;

    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000);
        return interaction.reply({
          content: `Please wait - you can use this command again <t:${expiredTimestamp}:R>.`,
          ephemeral: true,
        });
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    const transaction = Sentry.startTransaction({
      name: `/${command.data.name}`,
    });

    Sentry.setUser({
      id: interaction.user.id,
      username: interaction.user.username,
    });

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(
        "A slash command error occurred. Error has been reported to sentry."
      );
      Sentry.captureException(error);

      try {
        if (interaction.replied || interaction.deferred) {
          if (error instanceof CAHError) {
            await interaction.followUp({
              content: error.getMessage(),
              ephemeral: true,
            });
          } else {
            await interaction.followUp({
              content:
                "There was a backend error while executing this command. This error has been reported and will be investigated shortly. Sorry for the inconvenience.",
              ephemeral: true,
            });
          }
        } else {
          if (error instanceof CAHError) {
            await interaction.reply({
              content: error.getMessage(),
              ephemeral: true,
            });
          } else {
            await interaction.reply({
              content: "There was an error while executing this command!",
              ephemeral: true,
            });
          }
        }
      } catch(e) {
        Sentry.captureException(error);
      }
    } finally {
      transaction.finish();
      Sentry.setUser(null);
    }
  },
};
