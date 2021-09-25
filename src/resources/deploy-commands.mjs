import dotenv from "dotenv";
import { SlashCommandBuilder } from "@discordjs/builders";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";

dotenv.config();

const commands = [
	new SlashCommandBuilder().setName("p").setDescription("toPlay").addStringOption(
		options => options.setName("link").setDescription("the Link")).addChannelOption(options => options.setName("channel").setDescription("channel info")),
	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

rest.put(Routes.applicationGuildCommands(process.env.CLIENTID, process.env.GUILDID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);