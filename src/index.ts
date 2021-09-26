import dotenv from "dotenv";
import { Client, Constants, Intents, Snowflake } from "discord.js";
import { joinVoiceChannel, createAudioPlayer, createAudioResource } from "@discordjs/voice";
import { convertMusic } from "./musicDownloader";

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
		console.log(interaction.options.getChannel("channel"))
		const interactionUserChannel = interaction.guild?.members.cache.find((user) => user.id === interaction.user.id)?.voice.channel

		if(!interactionUserChannel) {
			await interaction.reply("Não foi possivel entrar no canal")
			return;
		}
		console.log();

		const voiceConnection = joinVoiceChannel({
			guildId: interactionUserChannel.guildId,
			channelId: interactionUserChannel.id,
			adapterCreator: interactionUserChannel.guild.voiceAdapterCreator,
		})

		const resource = createAudioResource(convertMusic());
		const player = createAudioPlayer();
		player.play(resource);


		voiceConnection.subscribe(player)

	} else if (commandName === 'server') {
        if (!interaction.guild) return;
        await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);

	}
});

client.login(process.env.TOKEN);
