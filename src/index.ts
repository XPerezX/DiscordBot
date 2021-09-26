import dotenv from "dotenv";
import { Client, Intents } from "discord.js";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior } from "@discordjs/voice";
import * as playdl from 'play-dl'

dotenv.config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });

client.once("ready", () => {
    console.log("Mãe ta on");
});

client.on("interactionCreate", async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === "p") {

		await interaction.reply("Musica selecionada");
		const interactionUserChannel = interaction.guild?.members.cache.find((user) => user.id === interaction.user.id)?.voice.channel;
		const ytbUrl = interaction.options.getString("link");

		if(!interactionUserChannel || !ytbUrl) {
			await interaction.reply("Não foi possivel entrar no canal")
			return;
		}

		const voiceConnection = joinVoiceChannel({
			guildId: interactionUserChannel.guildId,
			channelId: interactionUserChannel.id,
			adapterCreator: interactionUserChannel.guild.voiceAdapterCreator,
			selfDeaf: false,
		})

		let stream = await playdl.stream(ytbUrl);

        const resource = createAudioResource(stream.stream, { inputType: stream.type });
		let player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });
		
		voiceConnection.subscribe(player);
		player.play(resource);
		
	} else if (commandName === 'server') {
        if (!interaction.guild) return;
        await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);

	}
});

client.login(process.env.TOKEN);
