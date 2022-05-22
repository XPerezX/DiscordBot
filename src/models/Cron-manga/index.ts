import cron from "node-cron";
import axios from "axios";
import * as types from "../../resources/types";
import { IMangadexChapter } from "../../resources/types";

const discordApi = axios.create({
	baseURL: "https://discord.com/api",
});

const task = cron.schedule("*/2 * * * *", async () => {
	console.log("to funcionando");
	try {
		const resp = await axios.get<types.IMangadexResponse<IMangadexChapter[]>>("https://api.mangadex.org/chapter?limit=32&offset=0&translatedLanguage[]=en&includes[]=scanlation_group&includes[]=manga&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&order[readableAt]=desc");
		//console.log(resp.data);

		const mang = resp.data.data.find((item) => item.id === "bc2d2130-9c79-49e8-9078-57d82458d9a1")
		//console.log("manga escolhido", mang);
		if (mang) {
			const manga = mang.relationships.find((item) => item.type === "manga") as types.IMangadexManga
			console.log(manga);
			await discordApi.post(
				process.env.DISCORDWEBHOOKPOST!,
				{
					avatar_url: "https://i.pinimg.com/564x/57/67/f4/5767f44e38f2cc00536f323e78fe7b7c.jpg",
					embeds: [{
						title: `A New Chapter \n${manga.attributes.title["en"]}`,
						color: "14942328",
						description: manga ? (manga as types.IMangadexManga).attributes.description["en"]  : "comumname",
						thumbnail: {
							url: "https://uploads.mangadex.org/covers/28c77530-dfa1-4b05-8ec3-998960ba24d4/c82384af-bbef-4243-ac24-a60ae617d7a4.jpg",
						  }
					  }]
				}
			)
		}
	} catch (error) {
		console.log("error:", error);
	}
});

task.start();

