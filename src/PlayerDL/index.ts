import * as playdlLib from "play-dl";
import { Stream } from "play-dl/dist/SoundCloud/classes";

import { CommandInteraction } from "discord.js";

import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    NoSubscriberBehavior,
    VoiceConnection,
    AudioPlayerStatus,
    getVoiceConnection,
    getVoiceConnections,
} from "@discordjs/voice";
import * as types from "./type";

export default class PlayerDL {

    public queue: Array<types.IQueue> = [];

    public player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play
        }
        
    });

    constructor() {
        /* this.player.on("stateChange", (_, newSate) => {
            console.log("proving the event can work here", newSate);
        }) */
        this.player.on(AudioPlayerStatus.Idle, async () => {
            this.skipCommand();
        });
    }

    public joinUserVoiceChannel = (userVoiceChannel: types.TInteractChannel) => {

        if (!userVoiceChannel) {
            throw new Error("Você não está em nenhuma sala");
        }

        if (this.getCurrentVoiceConnection()) {
            return;
        }

        return joinVoiceChannel({
			guildId: userVoiceChannel.guildId,
			channelId: userVoiceChannel.id,
			adapterCreator: userVoiceChannel.guild.voiceAdapterCreator,
			selfDeaf: false,
		});
    }

    public getCurrentVoiceConnection = () => {
        const connection = getVoiceConnection(process.env.GUILDID!);
        console.log(connection);
        return connection;
    };

    private findSong = async (search: string) => {
        try {
            const playObject = await playdlLib.search(search, { limit: 1, source: { youtube: "video" }}) as types.IYoutubeVideo[];

            if (!playObject || !playObject[0].url) {
                throw new Error("Não foi possivel encontrar")
            }
            const currentVideo = playObject[0];
            this.addSongOnQueue(currentVideo);
        } catch(error) {
            console.error(error);
        }
    }

    private addSongOnQueue =(video: types.IYoutubeVideo) => {
        this.queue.push({
            url: video.url,
            durationRaw: video.durationRaw || null,
            title: video.title || null,
        });
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
            if (connection) {
                this.startPlaying(connection)
            }
        } catch(error) {
            console.log("custom Error", error);
            if (typeof error === "string") {
                await interaction.reply(error);
                return;
            }
            await interaction.reply("Ocorreu um erro");
        }
    }

    public getNextResource = async (video: types.IQueue) => {
        const stream = await playdlLib.stream(video.url);
        const resource = createAudioResource(stream.stream, { inputType: stream!.type });

        if (!resource) {
            throw new Error("dwadwa");
        }
        return resource;
    }


    public startPlaying = async (connection: VoiceConnection) => {
        connection.subscribe(this.player);
        this.nextSong();
    }

    public nextSong = async () => {
        if (!this.queue.length) {
            throw new Error("Não há musica para ser tocada");
        }

        const resource = await this.getNextResource(this.queue[0]);
        this.player.play(resource);
    }

    public skipCommand =  () => {
        if (!this.queue.length) {
            throw new Error("Não há musica para ser tocada");
        }
        this.queue.shift();
        this.nextSong()
    }

};