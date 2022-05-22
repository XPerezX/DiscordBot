
import { VoiceChannel, StageChannel } from "discord.js";

export interface IQueue {
	url: string;
	title?: string | null;
	durationRaw?: string | null;
}

export type TInteractChannel = VoiceChannel | StageChannel  | null | undefined;

export interface IYoutubeVideo {
	id: string;
	url: string;
	title: string;
	durationRaw: string;
	durationInSec: number;
	views: number;
}