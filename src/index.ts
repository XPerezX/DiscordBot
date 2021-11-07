import dotenv from "dotenv";
import { Client, Intents, } from "discord.js";
import Player from "./Classes/Player"

import strings from "./resources/strings";

dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

const player = new Player();

client.once("ready", () => {
    console.log("Mãe ta on");
});

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === "p") {

		const interactionUserChannel = interaction.guild?.members.cache.find((user) => user.id === interaction.user.id)?.voice.channel;

		player.playCommand(interaction, interactionUserChannel);

	} else if (commandName === "queue") {
        if (!interaction.guild) return;
		if(!player.queueHandler.list.length) {
			return await interaction.reply("não a nada na fila");
		}

		const title = "Lista:"
		const playList = player.queueHandler.list.map((item, index) => `${index + 1}º ${item.title ? item.title: "No named"}`)
		playList.unshift(title);
       await interaction.reply(playList.join("\n"));

	} else if (commandName === "s") {
        player.skipCommand();
		await interaction.reply(strings.success.skipSong);
	}
});

client.login(process.env.TOKEN);
