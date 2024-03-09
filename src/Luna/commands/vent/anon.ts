import { EmbedBuilder } from "discord.js";
import { command, commandOptionTypes } from "../../bot";
import { guildData } from "../../../database";


const ANON: command = {
    interaction: {
        name: "anon",
        description: "Sends a message into a vent channel for you",
        options: [{
            name: "message",
            type: commandOptionTypes.STRING,
            required: true,
            description: "the message to send into the channel.",
            max_length: 3500
        }, {
            name: "reaction",
            description: "The reaction to show what people can respond with (Also will say at the bottom)",
            type: commandOptionTypes.STRING,
            required: true,
            choices: [{
                name: "Can/Please respond",
                value: "please"
            }, {
                name: "I dont care",
                value: "dont_care"
            }, {
                name: "Dont respond",
                value: "dont"
            }]
        }]
    },
    message: {
        name: "anon",
        description: "Sends a message into a vent channel for you",
        options: [{
                name: "message",
                description: "the message to send",
                type: "string",
                options: []
        }, {
            name: "reaction",
            description: "The reaction to show what people can respond with (Also will say at the bottom)",
            options: ["dont_care", "dont", "please"],
            type: "string"
        }]
    },

    run: async (LUNA, interaction, message, args) => {
        const conversions: any = {
            please: "Please feel free to respond.",
            dont_care: "I don't care if you respond.",
            dont: "Please don't respond."
        }
        
        if(interaction) {
            if(interaction.guild === null) {
                interaction.followUp("This command has to be used in a server!");
                return;
            }

            const message = interaction.options.get("message", true).value;
            const reaction = interaction.options.get("reaction", true).value;

            if(!message || !reaction || typeof message !== "string" || typeof reaction !== "string") {
                interaction.followUp({ephemeral: true, content: "Missing options!"});
                return;
            }

            let iconURL = LUNA.CLIENT.user?.avatarURL() ?? "";

            const embed = new EmbedBuilder()
                .setAuthor({ name: "Please be respectful.", url: "https://shirodev.dev/", iconURL: iconURL })
                .setDescription(message)
                .setFooter({ text: conversions[reaction] });

            let guild_info: guildData | undefined = LUNA.DATABASE.cache.guild[interaction.guild.id];

            // TODO: Reduce the amount of indentation.
            if(!guild_info) {
                guild_info = LUNA.DATABASE.loadGuildItem(interaction.guild.id);

                if(!guild_info) {
                    interaction.followUp("This server has not been registered!");
                    return;
                }
            }

            if(!guild_info.ventChannelID) {
                interaction.followUp({ ephemeral: true, content: "No vent channel has been registered for this server!" });
                return;
            }

            let channel = interaction.guild.channels.cache.get(guild_info.ventChannelID);

            if(!channel || !channel.isTextBased()) {
                interaction.followUp({ ephemeral: true, content: "Failed to get server vent channel!" });
                return;
            }

            channel.send({ embeds: [embed], content: "Please be respectful of the vent, and follow the users wishes." });

            interaction.followUp({ ephemeral: true, content: "Sent!" });

            return;
        }

        if(!message || !args) return;

        if(!message.guild) { 
            message.reply("must be used in a server!");    
            return;
        }

        const type = args[1];
        if(type !== "please" && type !== "dont_care" && type !== "dont") {
            await message.author.send(message.content);
            await message.author.send("Type has to be: 'please', 'dont_care', 'dont'");
            message.delete();
            return;
        }

        let vent_message = message.content.replace(`${LUNA.prefix}${args[0]}`, "").replace(args[1], "");

        const iconURL = LUNA.CLIENT.user?.avatarURL() ?? "";

        const embed = new EmbedBuilder()
            .setAuthor({ name: "Please be respectful.", url: "https://shirodev.dev/", iconURL: iconURL})
            .setDescription(vent_message)
            .setFooter({ text: conversions[type] });

        let guild_info: guildData | undefined = LUNA.DATABASE.cache.guild[message.guild.id];
        // TODO: Reduce the amount of indentation.
        if(!guild_info) {
            guild_info = LUNA.DATABASE.loadGuildItem(message.guild.id);
            if(!guild_info) {
                await message.author.send("This server has not been registered!");
                message.delete();
                return;
            }
        }

        if(!guild_info.ventChannelID) {
            await message.author.send("No vent channel has been registered for this server!");
            message.delete();
            return;
        }

        let channel = message.guild.channels.cache.get(guild_info.ventChannelID);

        if(!channel || !channel.isTextBased()) {
            await message.author.send("Failed to get server vent channel!");
            message.delete();
            return;
        }

        channel.send({ embeds: [embed], content: "Please be respectful of the vent, and follow the users wishes." });
        message.delete();
        return;
    }
}

export default ANON;
