import { EmbedBuilder } from "discord.js";
import { command } from "../../bot";

const ABOUT : command = {
    interaction: {
        name: "about",
        description: "Gives information on the bot!",
    },
    message: {
        name: "about",
        description: "Gives information on the bot!",
        options: []
    },

    run: async (_LUNA, interaction, message, _args) => {
        const EMBED = new EmbedBuilder()
            .setColor("#ff00ea")
            .setAuthor({ name: 'Luna', iconURL: "https://cdn.discordapp.com/avatars/1129166787028734092/40c5625d10016302979d02f44fa6101c.webp?size=32", url: "https://shirodev.dev" })
            .setFields([
                { name: "Developer", value: "Shiro / Puppynuff / Stella" },
                { name: "Prefix", value: "l. / slash commands"},
                { name: "Github", value: "https://github.com/puppynuff/LunaTS" },
                { name: "Version", value: "0.0.5" }
            ])
            .setFooter({text: "This is an early rendition of the bot, and doesn't reflect the final product."});

        if(interaction) {

            interaction.followUp({ embeds: [EMBED]})
            return;
        }

        if(!message) return;
        message.reply({ embeds:[EMBED] });
        return;
    },
    ephemeral: false
}

export default ABOUT;
