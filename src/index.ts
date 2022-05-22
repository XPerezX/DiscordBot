import dotenv from "dotenv";
import { Client, Intents, } from "discord.js";

import commands from "./commands"
import strings from "./resources/strings";

import "./models/Cron-manga";

dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

client.once("ready", () => {
    console.log("I'm Online");
});

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	const currentCommand = commands[commandName] || null;

	if(!currentCommand) {
		await interaction.reply(strings.errors.cannotFindCommand)
	}

	currentCommand(interaction);
});

client.login(process.env.TOKEN);
