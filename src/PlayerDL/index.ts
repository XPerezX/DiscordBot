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
    VoiceConnectionStatus,
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
        this.player.on(AudioPlayerStatus.Idle, () => {
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
       const connection =  joinVoiceChannel({
			guildId: userVoiceChannel.guildId,
			channelId: userVoiceChannel.id,
			adapterCreator: userVoiceChannel.guild.voiceAdapterCreator,
			selfDeaf: false,
		});
        return connection;
    }

    public getCurrentVoiceConnection = () => {
        const connection = getVoiceConnection(process.env.GUILDID!);
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

        try {
            const currentSearch = this.verifiedSearch(interaction.options.getString("search"));
            const connection = this.joinUserVoiceChannel(userVoiceChannel);
            await this.findSong(currentSearch);
            
            await interaction.reply("Musica adicionada");

            if (connection) {
                this.startPlaying(connection)
            }

            if (!connection && this.player.state.status === AudioPlayerStatus.Idle && this.queue.length > 0) {
                this.nextSong();
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
        const playConnection = connection.subscribe(this.player);

        connection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log("matando tudo");
            playConnection?.unsubscribe();
            this.clearQueue();
            connection.destroy()
            this.stopPlayer();
        })

        this.player.on(AudioPlayerStatus.Idle, () => {
            setTimeout(() => {
                if (!this.queue.length) {
                    console.log("TIME OUT RELEASE");
                    playConnection?.unsubscribe();
                    this.clearQueue();
                    connection.destroy()
                    this.stopPlayer();
                }
            }, 120000);
        });

        this.nextSong();
    }

    public nextSong = async () => {
        if (!this.queue.length) {
            this.stopPlayer();
            return;
        }

        const resource = await this.getNextResource(this.queue[0]);
        this.player.play(resource);
    }

    public skipCommand =  () => {
        if (!this.queue.length) {
            return;
        }
        this.queue.shift();
        this.nextSong()
        
    }

    private clearQueue = () => {
        this.queue = [];
    }

    private stopPlayer = () => {
        this.player.stop();
    }
};