import dotenv from "dotenv";
import { Client, Intents } from "discord.js";

dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

client.once("ready", () => {
    console.log("Mãe ta on");
});

client.on("messageCreate", async msg => {
    if (msg.content === "Hello") {
        await msg.reply("I'm Working");
    }
})

client.login(process.env.TOKEN);
