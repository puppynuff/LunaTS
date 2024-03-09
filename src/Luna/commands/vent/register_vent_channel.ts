import { command, commandOptionTypes } from "../../bot";
import { guildData } from "../../../database";


const REGISTER_VENT_CHANNEL: command = {
    interaction: {
        name: "register_vent_channel",
        description: "Registers a vent channel into the database",
        options: [{
            name: "channel",
            type: commandOptionTypes.CHANNEL,
            required: true,
            description: "The channel to register"
        }]
    },
    message: {
        name: "register_vent_channel",
        description: "Registers a vent channel into the database",
        options: [{
            name: "channel",
            description: "the channel to register",
            type: "string",
            options: []
        }]
    },

    run: async (LUNA, interaction, message, args) => {
        if(interaction) {
            const channel = interaction.options.get("channel", true).channel;

            if(!channel || interaction.guild?.id == null) {
                interaction.followUp({ ephemeral: true, content: "Failed to resolve channel!" });
                return;
            }
            let guild_information: guildData | undefined = LUNA.DATABASE.cache.guild[interaction.guild?.id];

            if(!guild_information) {
                guild_information = LUNA.DATABASE.loadGuildItem(interaction.guild?.id) ?? {
                    id: interaction.guild?.id
                };
            }

            if(guild_information == undefined) return;
            guild_information.ventChannelID = channel.id;

            LUNA.DATABASE.saveItem("guild", interaction.guild.id, guild_information);

            interaction.followUp("Set channel~");

            return;
        }

        if(message == undefined || args == undefined) return;

        if(!args[1]) {
            message.reply("Missing channel! Remember to do #channel_name");
            return;
        }

        const channelID = args[1].replace("<", "").replace("#", "").replace(">", "");

        if(message.guild == undefined) {
            message.reply("This command has to be used in a server!");
            return;
        }

        const channel = LUNA.CLIENT.guilds.cache.get(message.guild?.id)?.channels.cache.get(channelID);

        if(!channel) {
            message.reply("Failed to get channel!");
            return;
        }

        let guild_information: any | undefined = LUNA.DATABASE.cache.guild[message.guild.id];

        if(!guild_information) {
            guild_information = LUNA.DATABASE.loadGuildItem(message.guild.id) ?? {
                id: message.guild.id,
                ventChannelID: ""
            };
        }

        guild_information.ventChannelID = channel.id;

        LUNA.DATABASE.saveItem("guild", message.guild.id, guild_information);

        message.reply("Set channel~");

        return;
    }
}

export default REGISTER_VENT_CHANNEL;
