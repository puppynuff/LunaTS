import { ActivityType, Client, Message, CommandInteraction, GatewayIntentBits } from "discord.js";
import database from "../database";
const glob = require("glob");
const TERMINAL_KIT = require("terminal-kit");

export class Luna {
    CLIENT: Client;
    commands: Array<command>;
    latest_error: string;
    prefix: string;
    DATABASE: database;

    constructor(intents: Array<GatewayIntentBits>, token: string, BOT_DATABASE: database) {
        if(!token) throw new Error("Class is missing the token!");

        // Creating the client
        this.CLIENT = new Client({
            intents: intents,
        });

        this.prefix = "l.";
        this.latest_error = "None!";

        this.commands = [];
        this.#handleEvents();

        this.DATABASE = BOT_DATABASE;

        this.CLIENT.login(token);
    }

    #handleEvents() {
        this.CLIENT.on("ready", async () => {
            this.CLIENT.user?.setPresence({
                status: "dnd",
                activities: [{
                    name: "Don't be bothered messaging me, account's disabled. Although you can message on steam.",
                    type: ActivityType.Custom
                }]
            });

            this.#registerCommands();
        });

        this.CLIENT.on("interactionCreate", async(interaction) => {
            if(!interaction.isCommand()) return;

            await interaction.deferReply({ ephemeral: true });

            for(let i = 0; i < this.commands.length; i++) {
                if(this.commands[i].interaction.name !== interaction.commandName) continue;

                try {
                    await this.commands[i].run(this, interaction, undefined, undefined);

                    return;
                } catch(err: any) {
                    this.latest_error = err.message;
                    console.log(err);
                    interaction.followUp({ ephemeral: true, content: "Error running command!" });
                    return;
                }
            }

            interaction.followUp({ ephemeral: true, content: "Couldn't find command! (For some reason)" });
            return;
        });

        this.CLIENT.on("messageCreate", async (message) => {
            let msg = message.content;

            if(message.author.bot == true) return;

            if(!msg.startsWith(this.prefix)) return;

            msg = msg.replace(this.prefix, "");

            let args: Array<string> = msg.split(" ");

            for(let i = 0; i < this.commands.length; i++) {
                if(this.commands[i].message.name.toLowerCase() !== args[0].toLowerCase()) continue;

                try {
                    return await this.commands[i].run(this, undefined, message, args);
                } catch(err: any) {
                    message.reply("There was an error~");
                   this.latest_error = err.message;
                   console.log(err);
                   return;
                }
            }

            message.reply("Unable to find command!");
            return;

        });
    }

    #registerCommands() {
        glob(`${process.cwd().replaceAll("\\", "/")}/dist/Luna/commands/**/*.js`, (err: any, files: any) => {
            if (err) throw new Error(err.message);

            for(let i = 0; i < files.length; i++) {
                const COMMAND: any = require(files[i]).default;

                if(!COMMAND.message?.name) continue;

                this.commands.push(COMMAND);

                if(this.CLIENT.isReady()) {
                    this.CLIENT.application.commands.create(COMMAND.interaction);
                }
            }
        });
    }
}

export interface command {
    interaction: {
        type?: 1 | 2 | 3;
        name: string;
        name_localizations?: {};
        description: string;
        description_localizations?: {};
        options?: Array<commandOption>;
        default_member_permissions?: string;
        default_permission?: boolean;
    };
    message: {
        name: string;
        description: string;
        options: Array<{
            type: string;
            name: string;
            description: string;
            options: Array<string>;
        }>;
    };

    run: (LUNA: Luna, interaction: CommandInteraction | undefined, message: Message | undefined, args: Array<string> | undefined) => Promise<void>;
}

interface commandOption {
    type: number;
    name: string;
    name_localizations?: {};
    description: string;
    description_localizations?: {};
    required?: boolean;
    choices?: Array<{
        name: string;
        name_localizations?: {};

        value: number | string;
    }>;
    options?: Array<commandOption>;
    channel_type?: {};
    min_value?: number;
    max_value?: number;
    min_length?: number;
    max_length?: number;
    autocomplete?: boolean;
}

const commandOptionTypes: commandOptionInterface = {
    SUB_COMMAND: 1,
    SUB_COMMAND_GROUP: 2,
    STRING: 3,
    INTEGER: 4,
    BOOLEAN: 5,
    USER: 6,
    CHANNEL: 7,
    ROLE: 8,
    MENTIONABLE: 9,
    NUMBER: 10,
    ATTATCHMENT: 11
}

export { commandOptionTypes };

export interface commandOptionInterface {
    SUB_COMMAND: 1;
    SUB_COMMAND_GROUP: 2;
    STRING: 3;
    INTEGER: 4;
    BOOLEAN: 5;
    USER: 6;
    CHANNEL: 7;
    ROLE: 8;
    MENTIONABLE: 9;
    NUMBER: 10;
    ATTATCHMENT: 11;
}
