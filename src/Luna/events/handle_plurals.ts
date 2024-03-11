import { Message, TextChannel, WebhookClient, Webhook, Channel, EmbedBuilder } from "discord.js";
import { Luna } from "../bot";

async function handle_plurals(LUNA: Luna, message: Message, args: Array<string>) {
    // Check if the plural is active.
    let prefix = message.content.slice(0, 3);

    // Check if they have a plural in the database
    const userData = LUNA.DATABASE.loadUserItem(message.author.id);
    if(!userData || userData.plurals == undefined) return; // If the plural doesn't exist, or the user isn't in the database return;
    if(userData.plurals[prefix] == undefined) return;

    let plural = userData.plurals[prefix];

    // Get the plural, and if its not already active, activate it.
    const CHANNEL = await isTextChannel(LUNA.CLIENT.channels.cache.get(message.channelId));
    if(!CHANNEL) return;

    let webhook_id = plural.channels[message.channelId]?.webhook_id;
    let webhook_token = plural.channels[message.channelId]?.webhook_token;
    let active_plural_client: WebhookClient | undefined = undefined;


    //  Check if the webhook exists, and then get it either from the active plurals or generate one.
    if(typeof webhook_id === "string" && typeof webhook_token === "string") {
        if(await webhookExists(CHANNEL, webhook_id)) {
            if(typeof LUNA.active_plurals[message.author.id]?.[prefix]?.[message.channel.id] !== "undefined") {
                active_plural_client = LUNA.active_plurals[message.author.id][prefix][message.channel.id];
            }
            else {
                active_plural_client = await generateWebhookClient(webhook_id, webhook_token);
                save_active_plural(LUNA, active_plural_client, message, prefix);
            }
        }
    }

    if(typeof active_plural_client === "undefined") {
       // Create the webhook then.
        let created_webhook = await CHANNEL.createWebhook({
            name: plural.name,
            avatar: plural.avatar
        }).catch(console.error);

        if(!created_webhook || typeof created_webhook.token !== "string") return;

        let generated_webhook_client = await generateWebhookClient(created_webhook.id, created_webhook.token);

        save_active_plural(LUNA, generated_webhook_client, message, prefix);

        userData.plurals[prefix].channels[message.channelId] = {
            webhook_token: generated_webhook_client.token,
            webhook_id: generated_webhook_client.id
        }

        active_plural_client = generated_webhook_client;

        LUNA.DATABASE.saveItem("user", message.author.id, userData);
    }

    if(typeof active_plural_client === "undefined") return;

    if(typeof message.reference?.messageId === "string") {
        const replied_message = message.channel.messages.cache.get(message.reference.messageId);
        if(!replied_message) return;

        if(replied_message.webhookId === active_plural_client.id) {
            if(message.content.replace(prefix, "") == "d") {
                active_plural_client.deleteMessage(message.reference.messageId);
                message.delete();
                return;
            }

            if(args[0].replace(prefix, "") == "e") {
                active_plural_client.editMessage(message.reference.messageId, message.content.replace(`${prefix}e `, ""));
                message.delete();
                return;
            }
        }

        // Generate with a link to the replied message
        const EMBED = new EmbedBuilder()
            .setAuthor({
                name: userData.plurals[prefix].name
            }).setDescription(`[Reply to:](${replied_message.url}) ${replied_message.content.slice(0, 100)}`);


        active_plural_client.send({
            content: message.content.replace(prefix, ""),
            embeds: [EMBED]
        });

        message.delete();
    }

    if(typeof message.reference?.messageId === "undefined") {
        active_plural_client.send(message.content.replace(prefix, ""));
        message.delete();
        return;
    }

    return;
}

async function generateWebhookClient(webhook_id: string, webhook_token: string) {
    const GENERATED_WEBHOOK_CLIENT = new WebhookClient({ url: `https://discord.com/api/webhooks/${webhook_id}/${webhook_token}` });
    return GENERATED_WEBHOOK_CLIENT;
}

async function isTextChannel(CHANNEL: Channel | undefined): Promise<TextChannel | false> {
    if(!CHANNEL) return false;
    if(CHANNEL instanceof TextChannel) return CHANNEL;
    return false;
}

async function webhookExists(CHANNEL: TextChannel, webhook_id: string | undefined): Promise<Webhook | false> {
    let webhooks = await CHANNEL.fetchWebhooks();

    let webhook = webhooks.get(webhook_id ?? "");
    if(webhook) return webhook;
    return false;
}

function save_active_plural(LUNA: Luna, webhook: WebhookClient, message: Message, prefix: string) {
    if(!LUNA.active_plurals[message.author.id]) LUNA.active_plurals[message.author.id] = {};
    if(!LUNA.active_plurals[message.author.id][prefix]) LUNA.active_plurals[message.author.id][prefix] = {};
    LUNA.active_plurals[message.author.id][prefix][message.channel.id] = webhook;
}

export default handle_plurals;
