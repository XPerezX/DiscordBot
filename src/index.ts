import dotenv from "dotenv";
import { Client, Intents, } from "discord.js";
import PlayerDL from "./PlayerDL"

dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

const playerDl = new PlayerDL();

client.once("ready", () => {
    console.log("Mãe ta on");
});

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === "p") {

		const interactionUserChannel = interaction.guild?.members.cache.find((user) => user.id === interaction.user.id)?.voice.channel;

		playerDl.playCommand(interaction, interactionUserChannel);

	} else if (commandName === "queue") {
        if (!interaction.guild) return;
		if(!playerDl.queue.length) {
			return await interaction.reply("não a nada na fila");
		}
		const c = playerDl.queue.map((item, index) => `${index + 1}º ${item.title ? item.title: "No named"}`)

       await interaction.reply(c.join(" "));
	} else if (commandName === "s") {
        playerDl.skipCommand();
		await interaction.reply("Musica pulada");
	}
});

client.login(process.env.TOKEN);
