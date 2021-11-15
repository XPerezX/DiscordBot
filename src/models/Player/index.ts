import * as playdlLib from "play-dl";

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

import * as types from "../../resources/types";
import strings from "../../resources/strings";
import Queue from "../Queue";

export default class Player {

    public queueHandler = new Queue();

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

    public joinUserVoiceChannel = (userVoiceChannel?: types.TInteractChannel) => {

        if (!userVoiceChannel) {
            throw new Error(strings.errors.alreadyInAVoiceChannel);
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

    public verifiedSearch = (search: string | null): string => {
        if (!search) {
            throw new Error(strings.errors.nothingToSearch);
        }
        return search;
    }

    public playCommand = async (interaction: CommandInteraction, userVoiceChannel: types.TInteractChannel) => {

        try {
            const currentSearch = this.verifiedSearch(interaction.options.getString("search"));
            const connection = this.joinUserVoiceChannel(userVoiceChannel);
            await this.queueHandler.findSong(currentSearch);
            
            await interaction.reply(strings.success.songWasAddedIntoPlayList);

            if (connection) {
                this.startPlaying(connection)
            }

            if (
                !connection && this.player.state.status === AudioPlayerStatus.Idle
                && this.queueHandler.list.length > 0) {
                this.nextSong();
            }
        } catch(e) {
            const error = e as Error;
            if (error.message) {
                await interaction.reply(error.message);
                return;
            }
            await interaction.reply(strings.errors.theresAError);
        }
    }

    public getNextResource = async (video: types.IQueue) => {
        const stream = await playdlLib.stream(video.url);
        const resource = createAudioResource(stream.stream, { inputType: stream!.type });

        if (!resource) {
            throw new Error(strings.errors.theresAError);
        }
        return resource;
    }

    public startPlaying = async (connection: VoiceConnection) => {
        const playConnection = connection.subscribe(this.player);

        connection.on(VoiceConnectionStatus.Disconnected, () => {
            playConnection?.unsubscribe();
            this.queueHandler.clear();
            connection.destroy()
            this.stopPlayer();
        })

        this.player.on(AudioPlayerStatus.Idle, () => {
            setTimeout(() => {
                if (!this.queueHandler.list.length) {
                    playConnection?.unsubscribe();
                    this.queueHandler.clear();
                    connection.destroy()
                    this.stopPlayer();
                }
            }, 120000);
        });

        this.nextSong();
    }

    public nextSong = async () => {
        if (!this.queueHandler.list.length) {
            this.stopPlayer();
            return;
        }

        const resource = await this.getNextResource(this.queueHandler.getFirstOnQueue());
        this.player.play(resource);
    }

    public skipCommand =  () => {
        if (!this.queueHandler.list.length) {
            return;
        }
        this.queueHandler.skip();
        this.nextSong() 
    }

    private stopPlayer = () => {
        this.player.stop();
    }
};