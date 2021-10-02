import * as playdlLib from "play-dl";
import { Stream } from "play-dl/dist/SoundCloud/classes";

import { CommandInteraction } from "discord.js";

import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    NoSubscriberBehavior,
    VoiceConnection,
} from "@discordjs/voice";
import * as types from "./type";
import { LiveStreaming } from "play-dl/dist/YouTube/classes/LiveStream";

export default class PlayerDL {

    public queue: Array<types.IQueue> = [];

    public player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play
        }
    });

    constructor() {
        this.player.on("stateChange", (_, newSate) => {
            console.log("proving the event can work here", newSate);
        })
    }

    public joinUserVoiceChannel = (userVoiceChannel: types.TInteractChannel) => {

        if (!userVoiceChannel) {
            throw new Error("Não foi possivel entrar na sala");
        }

        return joinVoiceChannel({
			guildId: userVoiceChannel.guildId,
			channelId: userVoiceChannel.id,
			adapterCreator: userVoiceChannel.guild.voiceAdapterCreator,
			selfDeaf: false,
		});
    }

    private findSong = async (search: string) => {
        try {
            const playObject = await playdlLib.search(search, { limit: 1, source: { youtube: "video" }}) as types.IYoutubeVideo[];

            if (!playObject || !playObject[0].url) {
                throw new Error("Não foi possivel encontrar")
            }
            const currentVideo = playObject[0];
            this.queue.push({
                url: currentVideo.url,
                durationRaw: currentVideo.durationRaw || null,
                title: currentVideo.title || null,
            });
        } catch(error) {
            console.error(error);
        }
    }

    public verifiedSearch = (search: string | null): string => {
        if (!search) {
            throw new Error("Digite o nome da musica ou Url");
        }
        return search;
    }

    public playCommand = async (interaction: CommandInteraction, userVoiceChannel: types.TInteractChannel) => {

        const search = interaction.options.getString("search");

        try {
            const currentSearch = this.verifiedSearch(search);
            const connection = this.joinUserVoiceChannel(userVoiceChannel);
            await this.findSong(currentSearch);
            
            await interaction.reply("Musica adicionada");
            this.playMusic(connection)
        } catch(error) {

            if (typeof error === "string") {
                await interaction.reply(error);
                return;
            }
            await interaction.reply("Ocorreu um erro");
        }
    }

    public streamSong = async (video: types.IQueue) => {
        try {
            return await playdlLib.stream(video.url);
        } catch(error) {
            this.queue.shift();
        }
    }

    public playMusic = async (connection: VoiceConnection) => {
        try {
            if (!this.queue.length) {
                throw new Error("Não há musica para ser tocada");
            }
    
            const stream = await this.streamSong(this.queue[0]);
            
            
            const resource = createAudioResource(stream!.stream, { inputType: stream!.type });
            connection.subscribe(this.player);
            this.player.play(resource);

        } catch(e) {
            
        }
    }

    public skipCommand =  (connection: VoiceConnection) => {
        if (!this.queue.length) {
            throw new Error("Não há musica para ser tocada");
        }
    }

};