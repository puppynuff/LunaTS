// This is mostly just so (my friends and) I can keep track of what abilities we have and what account they are on.
import { command, commandOptionTypes } from "../../bot";
import fs from "fs";

const view_abilities: command = {
    ephemeral: true,
    async run(LUNA, interaction, message, args) {
        if(!interaction)  {
            if(message) return message.reply("Not developed for message commands yet");
            return;
        }


        let user = interaction.options.getUser("user", false)?.id;

        if(!user) user = interaction.user.id;


        if(!fs.existsSync(`${process.cwd().replaceAll("\\", "/")}/database/AUT/${user}.json`)) return interaction.followUp("They are not in the database!");

        const old_json = JSON.parse(fs.readFileSync(`${process.cwd().replaceAll("\\", "/")}/database/AUT/${user}.json`).toString()).abilities;

        for(const key in old_json) {
            console.log(key);
        }

        interaction.followUp("Not developed yet!");
        
    },
    interaction: {
        name: "view_abilities",
        description: "views a users current abilities",
        options:[{
            name: "user",
            description: "The user to view the abilities of",
            type: commandOptionTypes.USER,
            required: false
        }]        
    },
    message: {
        name: "view_abilities",
        description: "views a users current abilities",
        options: []
    }
}

export default view_abilities;