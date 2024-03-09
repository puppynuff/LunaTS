import { WebhookClient } from "discord.js";
import fs from "fs";

class database {
    path: string;
    cache: cacheData;
    constructor() {
        this.path = `${process.cwd().replaceAll("\\", "/")}/database`;

        if(!fs.existsSync(`${this.path}/guild`)) fs.mkdirSync(`${this.path}/guild`);
        if(!fs.existsSync(`${this.path}/user`)) fs.mkdirSync(`${this.path}/user`);

        this.cache = {
            user: {},
            guild: {}
        };
    }

    // For if an item is not in the cache
    loadUserItem(id : string): userData | undefined {
        if(!fs.existsSync(`${this.path}/user/${id}.json`)) return undefined;

        const item: userData = JSON.parse(fs.readFileSync(`${this.path}/user/${id}.json`).toString());
        this.cache.user[id] = item;

        return item;
    }


    loadGuildItem(id: string): guildData | undefined {
        if(!fs.existsSync(`${this.path}/guild/${id}.json`)) return undefined;

        const item: guildData = JSON.parse(fs.readFileSync(`${this.path}/guild/${id}.json`).toString());
        this.cache.guild[id] = item;

        return item;

    }

    // Save item to the cache
    saveItem(type: "guild" | "user", id: string, item: guildData | userData) {
        fs.writeFileSync(`${this.path}/${type}/${id}.json`, JSON.stringify(item));
        this.cache[type][id] = item;
        return true;
    }
}


export default database;

export interface cacheData {
    user: {
        [path: string]: userData;
    };
    guild: {
        [path: string]: guildData;
    }
}

export interface userData {
    id: string;
    plurals: {
        [prefix: string]: plural;
    };
}

export interface guildData {
    id: string;
    ventChannelID?: string;
}


export interface plural {
    [channel_id: string]: {
        [plural_prefix: string]: {
            webhook_id: string;
            webhook_token: string;
        }
    }
}

// If the webhook isn't there, make it and save it.
interface active_plurals {
    [user_id: string]: {
        [plural_prefix: string]: {
            [channel_id: string]: WebhookClient;
        }
    }
}
