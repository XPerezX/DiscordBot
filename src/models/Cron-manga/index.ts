import cron from "node-cron";
import strings from "../../resources/strings";
import MangaService from "../../services/MangaService";
import { discordService } from "../../resources/globalData";

const mangaService = new MangaService(discordService);

const task = cron.schedule("*/30 * * * *", async () => {
	try {
		if (!mangaService.mangaList.length) {
			const list = await mangaService.getList();
			console.log("list fetch: ", list);
		}
		await mangaService.handleMangaFetch();

		await discordService.sendEmbends();
		console.log("it has fetched cron job: ", discordService.embeds);
	} catch (error) {
		console.log(strings.errors.console.cronError, error);
	}
});

task.start();

