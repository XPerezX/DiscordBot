export interface IEmbed {
	title?: string;
	color?: string;
	description?: string;
	thumbnail?: {
		url: string;
		width?: number;
		height?: number;
	};
	timestamp?: Date | string;
}

export interface IDiscordPostMessage {
	avatar_url?: string;
	embeds?: IEmbed[];
}
