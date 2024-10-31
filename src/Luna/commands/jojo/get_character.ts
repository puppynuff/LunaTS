import { EmbedBuilder } from "discord.js";
import { command, commandOptionTypes } from "../../bot";
import fs from "fs";

const GET_JOJO_CHARACTER: command = {
    interaction: {
        name: "get_jojo_character",
        description: "Gives info on a certain jojo character",
        options: [
            {
                name: "character_name",
                description: "The name of the requested character",
                choices: [
                    {
                        name: "Jonathan Joestar",
                        value: "jonathan_joestar"
                    }
                ],
                type: commandOptionTypes.STRING,
                required: true
            }
        ]
    },
    message: {
        name: "get_jojo_character",
        description: "Gives info on a certain jojo character",
        options: []
    },
    async run (LUNA, interaction, message, args) {
        if(interaction) {
            const CHARACTER = interaction.options.get("character_name", true).value;

            if(!CHARACTER) return;

            const CHARACTER_JSON = JSON.parse(fs.readFileSync(`${process.cwd().replaceAll("\\", "/")}/database/jojo/characters/${CHARACTER}.json`).toString());

            const EMBED = new EmbedBuilder()
                .setTitle(`JoJo's bazaar adventure: ${CHARACTER_JSON.name}`)
                .addFields(
                    [
                        {
                            name : "Part",
                            value: CHARACTER_JSON.embeds.about.part
                        }, 
                        {
                            name: "Role",
                            value: CHARACTER_JSON.embeds.about.role
                        },
                        {
                            name: "Description",
                            value: CHARACTER_JSON.embeds.about.description
                        },
                        {
                            name: "Family",
                            value: CHARACTER_JSON.embeds.about.family
                        }, 
                        {
                            name: "Stand",
                            value: CHARACTER_JSON.embeds.about.stand
                        }, 
                        {
                            name: "In Anime?",
                            value: CHARACTER_JSON.embeds.about.in_anime ? "Yes" : "No"
                        }
                    ]
                ).setThumbnail(CHARACTER_JSON.part_image);

            return interaction.followUp({ embeds: [EMBED] });
        }

        if(message && args) {
            return message.reply("Not made for message commands (yet)");
        }
    },
    ephemeral: true
}

export default GET_JOJO_CHARACTER;