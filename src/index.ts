import dotenv from "dotenv";
import { createReadStream } from "fs";
import { Client, Constants, Intents, Snowflake } from "discord.js";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, PlayerSubscription, NoSubscriberBehavior, AudioPlayerStatus, VoiceConnectionStatus, StreamType } from "@discordjs/voice";
import ytdl from "ytdl-core";
import convertMusic from "./music";
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
		/* console.log(interaction.options.getString("link"));
		console.log(interaction.options.getChannel("channel")) */
		const interactionUserChannel = interaction.guild?.members.cache.find((user) => user.id === interaction.user.id)?.voice.channel

		if(!interactionUserChannel) {
			await interaction.reply("Não foi possivel entrar no canal")
			return;
		}
		//console.log();

		const voiceConnection = joinVoiceChannel({
			guildId: interactionUserChannel.guildId,
			channelId: interactionUserChannel.id,
			adapterCreator: interactionUserChannel.guild.voiceAdapterCreator,
			selfDeaf: false,
		})

		let stream = await playdl.stream("https://www.youtube.com/watch?v=f8Iom8RUOJY&t=167s&ab_channel=Cl%C3%A9sioNadson");

        const resource = createAudioResource(stream.stream, { inputType: stream.type });
		let player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        })
		/* 
		resource.playStream.on("data", m => console.log("playback error ", m)) */
		
		voiceConnection.subscribe(player);
		player.play(resource);
		
	} else if (commandName === 'server') {
        if (!interaction.guild) return;
        await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);

	}
});

client.login(process.env.TOKEN);
