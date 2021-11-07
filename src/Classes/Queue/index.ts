import * as playdlLib from "play-dl";

import * as types from "../../resources/types";
import strings from "../../resources/strings";

export default class Queue {

    public list: Array<types.IQueue> = [];

    public findSong = async (search: string) => {
        try {
            const playObject = await playdlLib.search(search, { limit: 1, source: { youtube: "video" }}) as types.IYoutubeVideo[];

            if (!playObject || !playObject[0].url) {
                throw new Error(strings.errors.cannotFindSong)
            }
            const currentVideo = playObject[0];
            this.addSongOnQueue(currentVideo);
        } catch(error) {
            console.error(error);
        }
    }

    private addSongOnQueue =(video: types.IYoutubeVideo) => {
        this.list.push({
            url: video.url,
            durationRaw: video.durationRaw || null,
            title: video.title || null,
        });
    }

    public getFirstOnQueue = () => this.list[0];

    public skip = () => this.list.shift();

    public clear = () => {
        this.list = [];
    }
}