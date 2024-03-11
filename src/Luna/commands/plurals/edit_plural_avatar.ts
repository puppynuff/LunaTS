import { TextChannel, WebhookClient } from "discord.js";
import { userData } from "../../../database";
import { command, commandOptionTypes } from "../../bot";

const EDIT_PLURAL_AVATAR: command = {
    interaction: {
        name: "edit_plural_avatar",
        description: "Edits the avatar of a plural",
        options: [{
            name: "plural_prefix",
            description: "The prefix of the plural you want to modify",
            required: true,
            type: commandOptionTypes.STRING
        }, {
            name: "avatar",
            description: "Change the avatar of your plural",
            required: true,
            type: commandOptionTypes.STRING
        }]
    },
    message: {
        name: "edit_plural_avatar",
        description: "Modifies a plurals avatar (Interaction only)",
        options: []
    },
    run: async (LUNA, interaction, message, args) => {
        if(interaction) {
            const CURRENT_PREFIX = interaction.options.get("plural_prefix", true).value;
            const AVATAR = interaction.options.get("avatar", true).value;

            if(typeof AVATAR !== "string" || typeof CURRENT_PREFIX !== "string") {
                interaction.followUp("Failed to get options!");
                return;
            }

            const user_data = LUNA.DATABASE.loadUserItem(interaction.user.id);
            if(user_data == undefined || !user_data.plurals || !user_data.plurals[CURRENT_PREFIX]) {
                interaction.followUp("That plural doesn't exist!");
                return;
            }

            user_data.plurals[CURRENT_PREFIX].avatar = AVATAR;

            for(const [KEY, VALUE] of Object.entries(user_data.plurals[CURRENT_PREFIX].channels)) {
                let current_webhook = VALUE;
                try {
                    const channel = LUNA.CLIENT.channels.cache.get(KEY);

                    if(channel && channel instanceof TextChannel) {
                        if(!current_webhook.webhook_id) continue;
                        let webhooks = await channel.fetchWebhooks();
                        if(webhooks.get(current_webhook.webhook_id) == undefined) throw new Error();


                        const LOADED_WEBHOOK = new WebhookClient({ url: `https://discord.com/api/webhooks/${current_webhook.webhook_id}/${current_webhook.webhook_token}`});


                        LOADED_WEBHOOK.edit({
                            avatar: AVATAR
                        });

                        if(!LUNA.active_plurals[interaction.user.id]) {
                                LUNA.active_plurals[interaction.user.id] = { [CURRENT_PREFIX]: {
                                    [KEY]: LOADED_WEBHOOK
                                }
                            };
                            continue;
                        }

                        LUNA.active_plurals[interaction.user.id][CURRENT_PREFIX][KEY] = LOADED_WEBHOOK;
                    }
                } catch(error) {
                    user_data.plurals[CURRENT_PREFIX].channels[KEY] = {};
                }
            }

            LUNA.DATABASE.saveItem("user", interaction.user.id, user_data)
            interaction.followUp("Successfully changed the name of the plural!");
            return;
        }
    }
}
export default EDIT_PLURAL_AVATAR;
