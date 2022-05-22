import axios from "axios";

import * as types from "../resources/types";
import DiscordWeebhookService from "./DiscordWeebhookService";
import strings from "../resources/strings";

export default class MangaService {

	private discordService: DiscordWeebhookService;

	public mangaList: string[] = [];

	private updatedMangaList: types.UpdatedMangaList[] = [];

	private api = axios.create({
		baseURL: "https://api.mangadex.org"
	});

	constructor(discordService: DiscordWeebhookService) {
		this.discordService = discordService;
	}

	public getList = async () => {
		const resp = await this.api.get<types.IMangadexResponse<types.IMangadexCustomList>>(`/list/${process.env.MANGADEXLIST!}`);

		const filterArrayToGetOnlyMangaTypes = resp.data.data.relationships.filter((item) => item.type !== "user");

		this.mangaList = filterArrayToGetOnlyMangaTypes.map((item) => item.id);
	}

	private getLatestChapters = async (mangaId: string): Promise<types.IMangadexChapter[]> => {

		const resp = await this.api.get<types.IMangadexResponse<types.IMangadexChapter[]>>(`/chapter?limit=15&manga=${mangaId}&translatedLanguage%5B%5D=en&contentRating%5B%5D=safe&contentRating%5B%5D=suggestive&contentRating%5B%5D=erotica&includeFutureUpdates=0&order%5BpublishAt%5D=desc`);

		return resp.data.data;
	}

	private getSimplifiedManga = async (id: string): Promise<types.ISimplifiedManga> => {

		const axiosResponse = await this.api.get<types.IMangadexResponse<types.IMangadexManga>>(`https://api.mangadex.org/manga/${id}?&includes[]=cover_art`);

		const manga = axiosResponse.data.data;

		const cover_art = manga.relationships.filter((item) => item.type === "cover_art")[0];

		const title = manga.attributes.title["ja"] || manga.attributes.title["en"] || manga.attributes.title["pt-br"] || ""
		const description = manga.attributes.description["en"] || manga.attributes.description["pt-br"] || manga.attributes.description["ja"] || ""

		return {
			title,
			description,
			image: strings.services.manga.mangaImage(id, cover_art.attributes.fileName),
		};
	}

	private checkIfIsPublishedToday = (chapter: types.IMangadexChapter) => {
		const currentDate = new Date()
		currentDate.setHours(0);
		currentDate.setMinutes(0);
		currentDate.setSeconds(0);

		return (new Date(chapter.attributes.publishAt) > currentDate);
	}

	private checkIfANewChapter = (chapter: types.IMangadexChapter, mangaId: string): boolean => {
		const isPublishedToday = this.checkIfIsPublishedToday(chapter);

		const updatedMangaData = this.findMangaInUpdatedMangaList(mangaId);

		if (updatedMangaData) {
			const isHigherThanTheLastUpdated = Number(chapter.attributes.chapter) > Number(updatedMangaData.latestChapter);

			return isPublishedToday && isHigherThanTheLastUpdated;
		}

		return isPublishedToday;
	}

	private findMangaInUpdatedMangaList = (id: string): types.UpdatedMangaList | undefined => {
		return this.updatedMangaList.find((item) => item.id === id);
	}

	private creatingChapterDecription = (chapters: types.IMangadexChapter[]): string => {

		const chapterAndLinks = chapters.map((item) => strings.services.manga.chapterLink(item.attributes.chapter, item.id, item.attributes.title || "" ))
		return chapterAndLinks.join("\n")
	}

	public handleMangaFetch = async () => {
		if (!this.mangaList.length) {
			console.log("[EMPTY]: No items in list");
			return;
		}
		const currentMangaId = this.mangaList[0];
		const latestChapters = await this.getLatestChapters(currentMangaId);

		const filterNewChapters = latestChapters.filter((item) => this.checkIfANewChapter(item, currentMangaId));

		if (!filterNewChapters.length) {
			this.removeMangaFromList();
			throw new Error("Manga Ain't got new chapters");
		}

		const manga = await this.getSimplifiedManga(currentMangaId);

		this.createChapterMangaEmbed(filterNewChapters, manga);

		this.addInUpdatedMangaList(currentMangaId, filterNewChapters[0].attributes.chapter);
		this.removeMangaFromList();
	};

	private removeMangaFromList = () => this.mangaList.shift();

	private createChapterMangaEmbed = (chapters: types.IMangadexChapter[], simplifiedManga: types.ISimplifiedManga) => {
		this.discordService.createNewChapterMangaEmbed({
			color: "14942328",
			thumbnail: {
				url: simplifiedManga.image,
				height: 200,
				width: 200,
			},
			title: simplifiedManga.title,
			description: this.creatingChapterDecription(chapters),
			timestamp: chapters[0].attributes.publishAt,	
		});
	};

	private addInUpdatedMangaList = (mangaId: string, latestChapter: string) => {
		this.updatedMangaList = this.updatedMangaList.filter((item) => item.id !== mangaId);

		this.updatedMangaList.push({ id: mangaId, latestChapter });
	}
	public clearAll = () => {
		this.mangaList = [];
		this.updatedMangaList = [];
	};
};
