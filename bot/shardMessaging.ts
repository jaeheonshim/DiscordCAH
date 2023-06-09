import { Client, TextBasedChannel } from "discord.js";

export async function sendMessageToUser(client: Client, userId: string, message) {
    const user = await client.users.fetch(userId);
    if (user) {
        return await user.send(message);
    }
    return false;
}

export async function sendMessageToChannel(client: Client, channelId: string, message) {
    return await client.shard.broadcastEval(async (c, { channelId, message }) => {
        const channel = (await c.channels.fetch(channelId) as TextBasedChannel);
        if (channel) {
            await channel.send(message);
            return true;
        }
        return false;
    }, { context: { channelId, message } });
}