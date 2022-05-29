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
					avatar_url: "https://i.pinimg.com/564x/ff/bd/79/ffbd79ff7a514052fc4050570f76332e.jpg",
					embeds: this.embeds,
				}
			)
			this.clearEmbeds();
		} catch (error) {
			console.error("[ERROR, SendEmbed]: ", error);
			
		}
	}
};
