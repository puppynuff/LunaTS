// This is mostly just so (my friends and) I can keep track of what abilities we have and what account they are on.
import { command, commandOptionTypes } from "../../bot";
import fs from "fs";

// name, value in each pair.
export const aut_abiity_name_choices: Array<string> = ["C-moon", "Made in Heaven", "D4C: Love Train", "The World: Over Heaven", "Planet // Shaper", "Sol", "Nocturnus", "STWR", "SPR", "XENO", "Locke", "Standless", "The Strongest", "Cursed Child", "Sorcerer Killer", "The Vessel", "King Of Curses", "Dawn", "Reaper", "Sans", "Asgore", "Vampire", "Base Hamon", "Jonathan Hamon", "Joseph Hamon", "Kars", "Brickbattle", "Umbra", "Killua", "Broly", "Yasuo", "Yone", "Chrono Warden", "Mero-Mero No Mi", "Ope Ope No Mi", "Suna Suna No Mi", "Gomu Gomu No Mi", "Hito Model: Nika", "Kuro Claws", "Gryphon", "Anshen", "Soul Survivor", "Dragon Knight", "Shadow", "Casey", "The World: High Voltage", "Dirty Deeds Done Dirt Cheap", "Weather Report", "Whitesnake", "Sticky Fingers", "King Crimson", "Gold Experience", "The Hand", "Crazy Diamond", "Killer Queen", "Shadow DIO", "Anubis", "Silver Chariot", "Magician's Red", "Star Platinum", "The World", "Star Platinum: The World", "Gold Experience Requiem", "Star Platinum"];

const register_aut_ability: command = {
    ephemeral: false,
    async run(LUNA, interaction, message, args) {
        if(!interaction)  {
            if(message) return message.reply("Not developed for message commands yet");
            return;
        }

        const ability_name = interaction.options.get("ability_name", true).value;
        const rarity = interaction.options.get("rarity", true).value;
        const obtained = interaction.options.get("obtained", false)?.value;
        const current_level = interaction.options.get("current_level", false)?.value;
        const current_prestige = interaction.options.get("current_prestige", false)?.value;
        const base_haki_obtained = interaction.options.get("base_haki_obtained", false)?.value;
        const ultra_instict_haki_obtained = interaction.options.get("ultra_instict_haki_obtained", false)?.value;
        const burst_haki_obtained = interaction.options.get("burst_haki_obtained", false)?.value;
        const date_obtained = interaction.options.get("date_obtained", false)?.value;
        const account_name = interaction.options.get("account_name", false)?.value;

        if(!ability_name || !rarity) return interaction.followUp("An error occured!");

        if(!fs.existsSync(`${process.cwd().replaceAll("\\", "/")}/database/AUT/${interaction.user.id}.json`)) return interaction.followUp("You are not in the database!");

        const old_json = JSON.parse(fs.readFileSync(`${process.cwd().replaceAll("\\", "/")}/database/AUT/${interaction.user.id}.json`).toString())

        old_json.abilities[ability_name.toString()] = {
            rarity: rarity.toString(),
            obtained: obtained ? obtained : false,
            current_level: current_level ? current_level : 0,
            current_prestige: current_prestige ? current_prestige : 0,
            base_haki_obtained : base_haki_obtained ? base_haki_obtained : false,
            ultra_instict_haki_obtained : ultra_instict_haki_obtained ? ultra_instict_haki_obtained : false,
            burst_haki_obtained :  burst_haki_obtained ? burst_haki_obtained : false,
            date_obtained : date_obtained ? date_obtained : "Not set.",
            account_name : account_name ? account_name : "No account identified"
        }

        fs.writeFileSync(`${process.cwd().replaceAll("\\", "/")}/database/AUT/${interaction.user.id}.json`, JSON.stringify(old_json));

        return interaction.followUp("Successfully wrote the ability");

    },
    interaction: {
        name: "register_aut_ability",
        description: "puts a aut ability in your database entry",
        options: [{
            name: "ability_name",
            description: "The name of the ability",
            type: commandOptionTypes.STRING,
            autocomplete: true,
            required: true
        },
        {
            name: "rarity",
            description: "The abilities rarity",
            type: commandOptionTypes.STRING,
            choices: [{
                name: "common",
                value: "Common"
            }, {
                name: "uncommon",
                value: "Uncommon"
            }, {
                name: "rare",
                value: "Rare"
            }, {
                name: "epic",
                value: "Epic"
            }, {
                name: "legendary",
                value: "Legendary"
            }, {
                name: "mythic",
                value: "Mythic"
            }],
            required: true
        }, {
            name: "obtained",
            description: "Whether or not you have obtained it",
            type: commandOptionTypes.BOOLEAN,
        }, {
            name: "current_level",
            description: "The level of the character",
            type: commandOptionTypes.NUMBER,
            min_value: 0,
            max_value: 200
        }, {
            name: "current_prestige",
            description: "The current prestige of the character",
            type: commandOptionTypes.NUMBER,
            min_value: 0,
            max_value: 20
        }, {
            name: "base_haki_obtained",
            description: "Whether or not you have the base haki",
            type: commandOptionTypes.BOOLEAN
        }, {
            name: "ultra_instict_haki_obtained",
            description: "Whether or not you have the ultra instinct haki",
            type: commandOptionTypes.BOOLEAN
        }, {
            name: "burst_haki_obtained",
            description: "Whether or not you have the burst haki",
            type: commandOptionTypes.BOOLEAN
        }, {
            name: "date_obtained",
            description: "The day you obtained the character",
            type: commandOptionTypes.STRING
        }, {
            name: "account_name",
            description: "The account that has the character currently",
            type: commandOptionTypes.STRING
        }
    ]
    },
    message: {
        name: "register_aut_ability",
        description: "puts a aut ability in your database entry",
        options: []
    },
    async autocomplete(interaction) {
        const FOCUSED_VALUE = interaction.options.getFocused();

        const filtered = aut_abiity_name_choices.filter(choice => choice.startsWith(FOCUSED_VALUE));
        if(filtered.length > 25) filtered.length = 25;
        interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice }))
        )
    },
}


export default register_aut_ability;