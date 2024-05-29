import { EmbedBuilder } from "discord.js";
import { command, commandOptionTypes } from "../../bot";
import fs from "fs";

const GET_JOJO_PART_INFO: command = {
    interaction: {
        name: "get_jojo_part_info",
        description: "Gives the information on a given JoJo part",
        options: [
            {
                name: "part",
                description: "The part you want info on",
                type: commandOptionTypes.STRING,
                choices: [
                    {
                        name: "Part One",
                        value: "part_one"
                    },
                    {
                        name: "Part Two",
                        value: "part_two"
                    },
                    {
                        name: "Part Three",
                        value: "part_three"
                    }
                ],
                required: true
            }
        ],
    },
    message: {
        name: "get_jojo_part",
        description: "Gives the information on a specific JoJo part",
        options: []
    },
    run: async (LUNA, interaction, message, args) => {
        if(interaction) {
            const PART = interaction.options.get("part", true).value;

            if(!PART) return;

            const PART_JSON = JSON.parse(fs.readFileSync(`${process.cwd().replaceAll("\\", "/")}/database/jojo/parts/${PART}.json`).toString());


            const EMBED = new EmbedBuilder()
                .setTitle(`JoJo's bazaar adventure: ${PART_JSON.part_name}`)
                .addFields(
                    [
                        {
                            name: "Main Character",
                            value: PART_JSON.part_main_character
                        }, {
                            name: "Number of episodes",
                            value: `${PART_JSON.number_of_episodes}`
                        }, {
                            name: "Anime Adaptation Released?",
                            value: PART_JSON.anime_adaptation_released ? "Yes" : "No"
                        }
                    ]
                ).setThumbnail(PART_JSON.part_image);

            return interaction.followUp({ embeds: [EMBED] });
            
            
        }

        if(message) {
            return message.reply("Not made for message commands (Yet)");
        }
    },
    ephemeral: false
}


export default GET_JOJO_PART_INFO;