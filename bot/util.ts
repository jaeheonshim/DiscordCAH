import { BaseGuildTextChannel, BaseInteraction, GuildMember, Interaction, TextBasedChannel, User } from "discord.js";
import { CAHError } from "../game/model/cahresponse";
import axios from "axios";

const checkDMCooldown = new Map<string, number>();
const DM_RECHECK_COOLDOWN = 10 * 60 * 1000; // recheck DM permissions after 10 minutes

export async function checkCanSendDM(interaction) {
    const cooldown = checkDMCooldown.get(interaction.user.id);
    if(cooldown && (Date.now() - cooldown) < DM_RECHECK_COOLDOWN) return;

    try {
        await interaction.user.send({
            embeds: [
                {
                    title: "Test Message",
                    color: 0x00FF00,
                    description: "This is a test message to validate that you can receive messages from our bot. If you can see this message, you passed the test!\n\nIf other members of your game aren't seeing this message, tell them to enable server DMs (Server Name -> Privacy Settings -> Direct Messages).\n\n**Don't disable server DMs, or the bot won't work correctly!**"
                }
            ]
        });
        checkDMCooldown.set(interaction.user.id, Date.now());
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
            username: (interaction.member as GuildMember).nickname || interaction.user.username,
            channelId: interaction.channelId,
            channelName: interaction.channel.name,
            serverName: interaction.guild.name,
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

                    const channel = await interaction.client.channels.fetch(channelId);
                    console.log(channel);
                    if (channel.isTextBased) {
                        await (channel as TextBasedChannel).send(message)
                    }
                }
            }
        });
}