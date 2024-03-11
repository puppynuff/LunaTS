import { BaseGuildTextChannel, Message, TextChannel, WebhookClient } from "discord.js";
import { Luna } from "../bot";

async function handle_plurals(LUNA: Luna, message: Message) {
    // Check if the plural is active.
    let prefix = message.content.slice(0, 3);

    if(LUNA.active_plurals[message.author.id] && LUNA.active_plurals[message.author.id][prefix] && LUNA.active_plurals[message.author.id][prefix][message.channelId]) {
        LUNA.active_plurals[message.author.id][prefix][message.channelId].send(message.content.replace(prefix, ""));
        message.delete();
        return;
    }

    // Check if they have a plural in the database
    const userData = LUNA.DATABASE.loadUserItem(message.author.id);
    if(!userData || userData.plurals == undefined) return; // If the plural doesn't exist, or the user isn't in the database return;
    if(userData.plurals[prefix] == undefined) return;

    let plural = userData.plurals[prefix];

    if(plural.channels[message.channelId]) {
        const GENERATED_WEBHOOK_CLIENT = new WebhookClient({ url: `https://discord.com/api/webhooks/${plural.channels[message.channelId].webhook_id}/${plural.channels[message.channelId].webhook_token}`});
        GENERATED_WEBHOOK_CLIENT.send(message.content.replace(prefix, ""));
        message.delete();

        if(!LUNA.active_plurals[message.author.id]) LUNA.active_plurals[message.author.id] = {};
        if(!LUNA.active_plurals[message.author.id][prefix]) LUNA.active_plurals[message.author.id][prefix] = {};
        LUNA.active_plurals[message.author.id][prefix][message.channelId] = GENERATED_WEBHOOK_CLIENT;
        return;
    }

    const CHANNEL = LUNA.CLIENT.channels.cache.get(message.channelId);

    if(CHANNEL instanceof TextChannel) {
        let created_webhook = await CHANNEL.createWebhook({
            name: plural.name,
            avatar: plural.avatar
        }).catch(console.error);

        if(created_webhook) {
            created_webhook.send(message.content.replace(prefix, ""));
            message.delete();
            if(!LUNA.active_plurals[message.author.id]) LUNA.active_plurals[message.author.id] = {};
            if(!LUNA.active_plurals[message.author.id][prefix]) LUNA.active_plurals[message.author.id][prefix] = {};
            const GENERATED_WEBHOOK_CLIENT = new WebhookClient({ url: `https://discord.com/api/webhooks/${created_webhook.id}/${created_webhook.token}`});
            LUNA.active_plurals[message.author.id][prefix][message.channelId] = GENERATED_WEBHOOK_CLIENT;

            userData.plurals[prefix].channels[message.channelId] = {
                webhook_token: GENERATED_WEBHOOK_CLIENT.token,
                webhook_id: GENERATED_WEBHOOK_CLIENT.id,
            }
            LUNA.DATABASE.saveItem("user", message.author.id, userData);
        }
    }

    return;
}


export default handle_plurals;
