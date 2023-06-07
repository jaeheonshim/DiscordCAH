import { GuildMember, User } from "discord.js";
import { CAHError } from "../game/model/cahresponse";
import axios from "axios";

export async function checkCanSendDM(user: User, message: string) {
  try {
    await user.send(message);
    return true;
  } catch (error) {
    throw new CAHError(
      "Couldn't send direct messages to this user - make sure you've allowed server members to send you direct messages!"
    );
  }
}

export async function executeDefaultTextCommandServerRequest(interaction, endpoint) {
    await interaction.deferReply();

    await axios
        .post(endpoint, {
            userId: interaction.user.id,
            username: (interaction.member as GuildMember).nickname,
            channelId: interaction.channelId,
            channelName: interaction.channel.name,
            serverName: interaction.guild.name,
            displayAvatarURL: interaction.user.displayAvatarURL(),
        })
        .then((res) => {
            if (res.data) {
                for (const response of res.data.response) {
                    interaction.followUp(response);
                }
            }
        });
}