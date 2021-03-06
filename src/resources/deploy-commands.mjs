import dotenv from "dotenv";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

dotenv.config();

const commands = [
	new SlashCommandBuilder().setName("p").setDescription("search and play song").addStringOption(options => options.setName("search").setDescription("text or url to play")),
	new SlashCommandBuilder().setName("s").setDescription("skip the current song"),
	new SlashCommandBuilder().setName("queue").setDescription("show the queue"),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENTID, process.env.GUILDID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);