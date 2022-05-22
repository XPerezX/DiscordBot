import cron from "node-cron";
import strings from "../../resources/strings";
import MangaService from "../../services/MangaService";
import { discordService } from "../../resources/globalData";

const mangaService = new MangaService(discordService);

const task = cron.schedule("5 * * * * *", async () => {
	console.log("to funcionando");
	try {
		if (!mangaService.mangaList.length) {
			await mangaService.getList();
			return;
		}
		await mangaService.handleMangaFetch();

		await discordService.sendEmbends();
	} catch (error) {
		console.log(strings.errors.console.cronError, error);
	}
});

task.start();

