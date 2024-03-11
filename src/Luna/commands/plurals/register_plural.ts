import database, { userData } from "../../../database";
import { command, commandOptionTypes } from "../../bot";

const REGISTER_PLURAL: command = {
    interaction: {
        name: "register_plural",
        description: "Registers a plural for you to use",
        options: [{
            // This is very limited, but its so its easier for me to check for the plural.
            name: "prefix",
            description: "The prefix to talk through the plural (ex: d>Hello there!)",
            type: commandOptionTypes.STRING,
            required: true,
            max_length: 3,
            min_length: 3
        }, {
            name: "name",
            description: "The name of the plural",
            type: commandOptionTypes.STRING,
            required: true
        }, {
            name: "avatar",
            description: "The avatar for the plural (url)",
            type: commandOptionTypes.STRING,
            required: true
        }],
    },
    message: {
        name: "register_plural",
        description: "Registers a plural for you to use",
        options: [{
            name: "prefix",
            description: "The prefix to talk through the plural (ex: d>Hello there!)",
            type: "String",
            options: []
        }, {
            name: "name",
            description: "The name of the plural",
            type: "String",
            options: []
        }]
    },
    run: async (LUNA, interaction, message, args) => {
        if(interaction) {
            const NAME = interaction.options.get("name", true).value;
            const PREFIX = interaction.options.get("prefix", true).value;
            const AVATAR = interaction.options.get("avatar", true).value;

            if(typeof NAME != "string" || typeof PREFIX != "string" || typeof AVATAR != "string") {
                interaction.followUp("Failed to get options!");
                return;
            }

            let data: userData | undefined = LUNA.DATABASE.loadUserItem(interaction.user.id);

            if(!data) {
                data = {
                    id: interaction.user.id
                }
            }

            if(!data.plurals) data.plurals = {};

            data.plurals[PREFIX] = {
                name: NAME,
                avatar: AVATAR,
                channels: {}
            };

            LUNA.DATABASE.saveItem("user", interaction.user.id, data);
            interaction.followUp(`Registered plural!`);
            return;
        }

        if(!message || !args) {
            return;
        }

        message.reply("This command is only supported by interaction commands.");
    }
}

export default REGISTER_PLURAL;
