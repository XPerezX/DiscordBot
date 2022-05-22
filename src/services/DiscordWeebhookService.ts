import axios from "axios";

import * as types from "../resources/types";

export default class DiscordWeebhookService {

	public embeds: types.IEmbed[] = [];

	public createNewChapterMangaEmbed = (mangaEmbed: types.IEmbed) => {
		this.embeds.push(mangaEmbed);
	}

	public clearEmbeds = () => {
		this.embeds = [];
	}

	public sendEmbends = async () =>{
		if (!this.embeds.length) {
			console.log("There's no new Chapter");
			return;
		}
		try {
			await axios.post<types.IDiscordPostMessage>(process.env.DISCORDWEBHOOKPOST!,
				{
					avatar_url: "https://i.pinimg.com/564x/57/67/f4/5767f44e38f2cc00536f323e78fe7b7c.jpg",
					embeds: this.embeds,
				}
			)
			this.clearEmbeds();
		} catch (error) {
			console.error("[ERROR, SendEmbed]: ", error);
			
		}
	}
};
