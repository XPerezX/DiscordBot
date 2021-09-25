import dotenv from "dotenv";
import { Client, Intents } from "discord.js";

dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

client.once("ready", () => {
    console.log("Mãe ta on");
});

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === "p") {
		await interaction.reply("Musica selecionada");
		console.log(interaction.options.getString("link"));
	} else if (commandName === 'server') {
        if (!interaction.guild) return;
        await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);

	}
});

client.login(process.env.TOKEN);
