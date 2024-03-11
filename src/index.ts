/*
    *   Created by Shiro
    *   feb 24, 2024
*/

// Taking a hiatus from the discord plural thing.
// I want to try to make it so I can message through the bot.

// Importing modules
import dotenv from "dotenv";
import { Luna } from "./Luna/bot";
import { GatewayIntentBits, Message } from "discord.js";
import database from "./database";
import fs from "fs";
const TERMINAL_KIT = require("terminal-kit");
// Getting environment variables
dotenv.config();

// Checking the token, and creating the discord bot.
const BOT_TOKEN = process.env.BOT_TOKEN;

if(!BOT_TOKEN) throw new Error("Missing token. Make sure the .env file is setup!");

const BOT_DATABASE = new database();

const LUNA = new Luna([GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages], BOT_TOKEN, BOT_DATABASE);


// create discord thing.
let guilds: Array<{
    id: string,
    name: string
}> = [];
let current_guild: string = "";
let current_channel: string = "";

let bot_messages: Array<Message> = [];

let channel_messages: Array<Message> = [];

LUNA.CLIENT.on("ready", async () => {
    await get_guilds();
    generate_table_info(true);
});

async function getGuildChannelInfo() {
    let channel_array: Array<{
        channel_name: string,
        channel_id: string
    }> = [];

    LUNA.CLIENT.guilds.cache.get(current_guild)?.channels.cache.forEach((channel) => {
        if(channel.isTextBased() == true) {
            channel_array.push({
                channel_name: channel.name,
                channel_id: channel.id
            })
        }
    })

    return channel_array;
}

LUNA.CLIENT.on("messageCreate", () => generate_table_info());


async function get_guilds() {
    guilds = [];
    LUNA.CLIENT.guilds.cache.forEach((guild) => {
        guilds.push({
            name: guild.name,
            id: guild.id,
        })
    })
}

async function get_messages(amount: number) {
    channel_messages = [];
    if(current_channel == "" || current_guild == "") return [];

    let return_messages: Array<string> = [];

    let current_channel_object = LUNA.CLIENT.guilds.cache.get(current_guild)?.channels.cache.get(current_channel);


    if(current_channel_object?.isTextBased()) {
        let i = 0;
        await current_channel_object.messages.fetch({ limit: amount }).then(messages => {
            messages.forEach(message => {
                return_messages.push(`[${i}] ${message.author.displayName}: ${message.content}`);
                channel_messages.push(message);
                i++;
            });
        })

        return return_messages;
    }
}

async function generate_table_info(new_text_input: boolean = false) {
    if(!process.argv.includes("--dc")) return;

    let data  = [
        ['Guilds', 'Channels', 'Messages']
    ]

    if(!current_guild) current_guild = guilds[0].id;

    for(let i = 0; i < guilds.length; i++) {
        if(guilds[i].id == current_guild && !guilds[i].name.startsWith("> ")) guilds[i].name = `> ${guilds[i].name}`;
        data.push([guilds[i].name, '', '']);
    }

    if(!current_guild) current_guild = guilds[0].id;

    let channels = await getGuildChannelInfo();

    if(!current_channel) current_channel = channels[0].channel_id;

    for(let i = 0; i < channels.length; i++) {

        let current_line_data = [];
        if(data[i + 1]) current_line_data = data[i + 1];
        else current_line_data = [" ", " ", ""];

        if(channels[i].channel_id == current_channel) channels[i].channel_name = `> ${channels[i].channel_name}`;

        current_line_data[1] = channels[i].channel_name;
        data[i + 1] = current_line_data;
    }

    const messages = await get_messages(channels.length);
    if(messages) {
        let j = 1;
        for(let i = messages.length - 1; i >= 0;  i--) {
            data[j][2] = messages[i];
            j++;
        }
    }
    TERMINAL_KIT.terminal.table(data, {
        fit: true,
        borderChars: 'lightRounded',
    });

    if(!new_text_input) return;

    TERMINAL_KIT.terminal.inputField({}, async (error: any, input: string) => {
        if(input == "") return generate_table_info(true);

        if(input == "close_application~") return process.exit(0);

        if(input == `inv~`) {
            let invite = await channel_messages[0].guild?.invites.create(channel_messages[0].channel.id);

            fs.writeFileSync(`./generated_invite`, invite?.code ?? "");
            return generate_table_info(true);
        }
        if(input.startsWith("de~ ")) {
            let args = input.split(" ");

            let message_number = Number(args[1]);
            if(isNaN(message_number)) return generate_table_info(true);
            let message = input.replace(`${args[0]} `, "").replace(`${args[1]} `, "");

            if(channel_messages[message_number].editable) {
                await channel_messages[message_number].edit(message);
            }

            return generate_table_info(true);
        }

        if(input.startsWith("d~ ")) {
            let number = Number(input.replace("d~ ", ""));

            if(isNaN(number)) return generate_table_info(true);

            await channel_messages[number].delete();

            return generate_table_info(true);
        }

        if(input.startsWith("gc~ ")) {
            let guild_name = input.replace("gc~ ", "");
            for(let i = 0; i < guilds.length; i++) {
                if(guilds[i].name == guild_name) {
                    current_channel = "";
                    current_guild = guilds[i].id;
                    await get_guilds();
                    return generate_table_info(true);
                }
            }
            return generate_table_info(true);
        }

        if(input.startsWith("c~ ")) {
            let channel_name = input.replace("c~ ", "");

            for(let i = 0; i < channels.length; i++) {
                if(channels[i].channel_name == channel_name) {
                    current_channel = channels[i].channel_id;

                    return generate_table_info(true);
                }
            }

            return generate_table_info(true);
        }
        let channel = LUNA.CLIENT.guilds.cache.get(current_guild)?.channels.cache.get(current_channel);

        if(channel?.isTextBased()) {
            bot_messages.push(await channel.send(input));
        }

        return generate_table_info(true);
    });
}
