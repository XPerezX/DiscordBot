import cron from "node-cron";
import strings from "../../resources/strings";
import MangaService from "../../services/MangaService";
import { discordService } from "../../resources/globalData";

const mangaService = new MangaService(discordService);

console.log("starting cron");

const task = cron.schedule("*/25 * * * *", async () => {
	try {
		
		await mangaService.verifyIfListGotNewMangas();

		console.log("it has fetched cron job: ", discordService.embeds);
		await discordService.sendEmbends();
	} catch (e) {
		const error = e as Error;
		console.log(strings.errors.console.cronError, error.message);
	}
});

task.start();

