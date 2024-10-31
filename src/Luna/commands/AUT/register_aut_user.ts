// This is mostly just so (my friends and) I can keep track of what abilities we have and what account they are on.
import { command } from "../../bot";
import fs from "fs";

const register_aut_user: command = {
    ephemeral: true,
    async run(LUNA, interaction, message, args) {
        if(!interaction)  {
            if(message) return message.reply("Not developed for message commands yet");
            return;
        }


        fs.writeFileSync(`${process.cwd().replaceAll("\\", "/")}/database/AUT/${interaction.user.id}.json`, JSON.stringify({
            abilities: {},
            skins: {} // Probably will never be used.
        }));

        interaction.followUp("Successfully created file!");

    },
    interaction: {
        name: "register_aut_user",
        description: "creates an aut user file",
    },
    message: {
        name: "register_aut_ability",
        description: "puts a aut ability in your database entry",
        options: []
    }
}

export default register_aut_user
;