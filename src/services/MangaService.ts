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
		console.log("starting manga fetching", new Date());

		const axiosResponse = await this.api.get<types.IMangadexResponse<types.IMangadexManga>>(`https://api.mangadex.org/manga/${id}?&includes[]=cover_art`);

		const manga = axiosResponse.data.data;

		const cover_art = manga.relationships.filter((item) => item.type === "cover_art")[0];

		const title = manga.attributes.title["ja"] || manga.attributes.title["en"] || manga.attributes.title["pt-br"] || ""
		const description = manga.attributes.description["en"] || manga.attributes.description["pt-br"] || manga.attributes.description["ja"] || ""

		return {
			id: manga.id,
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

		return (new Date(chapter.attributes.readableAt) > currentDate);
	}

	private checkIfItIsANewChapter = (chapter: types.IMangadexChapter): boolean => {
		const isPublishedToday = this.checkIfIsPublishedToday(chapter);

		const mangaId = this.findMangaIdFromChapter(chapter);

		const updatedMangaData = this.findMangaInUpdatedMangaList(mangaId);

		if (updatedMangaData) {
			const isHigherThanTheLastUpdated = Number(chapter.attributes.chapter) > Number(updatedMangaData.latestChapter);

			return isHigherThanTheLastUpdated;
		}

		return isPublishedToday;
	}

	private findMangaInUpdatedMangaList = (id: string | null): types.UpdatedMangaList | null => {
		return this.updatedMangaList.find((item) => item.id === id) || null;
	}

	private creatingChapterDecription = (chapters: types.IMangadexChapter[]): string => {

		const chapterAndLinks = chapters.map((item) => strings.services.manga.chapterLink(item.attributes.chapter, item.id, item.attributes.title || "" ))
		return chapterAndLinks.join("\n")
	}

	public fetchAndVerifyIfMangaIsNew = async () => {
		if (!this.mangaList.length) {
			console.log("[EMPTY]: No items in list");
			return;
		}
		const currentMangaId = this.mangaList[0];
		const latestChapters = await this.getLatestChapters(currentMangaId);

		const filterNewChapters = latestChapters.filter((item) => this.checkIfItIsANewChapter(item));

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

	private findMangaIdFromChapter = (chapter: types.IMangadexChapter): string | null => {
		const manga = chapter.relationships.find((item) => item.type === "manga");

		return manga?.id || null;
	}

	private createChapterMangaEmbed = (chapters: types.IMangadexChapter[], simplifiedManga: types.ISimplifiedManga) => {
		this.discordService.createNewChapterMangaEmbed({
			color: "14942328",
			thumbnail: {
				url: simplifiedManga.image,
				height: 200,
				width: 200,
			},
			title: simplifiedManga.title,
			url: strings.services.manga.mangaUrl(simplifiedManga.id),
			description: this.creatingChapterDecription(chapters),
			timestamp: chapters[0].attributes.readableAt,
		});
	};

	private addInUpdatedMangaList = (mangaId: string, latestChapter: string) => {
		this.updatedMangaList = this.updatedMangaList.filter((item) => item.id !== mangaId);

		this.updatedMangaList.push({ id: mangaId, latestChapter });
	}

	private getFeedList = async (): Promise<types.IMangadexChapter[]> => {
		const listId = process.env.MANGADEXLIST;

		if (!listId) {
			throw new Error("Mangadex list env has not been set up");
		}
		const response = await axios.get<types.IMangadexResponse<types.IMangadexChapter[]>>(`https://api.mangadex.org/list/${listId}/feed?limit=20&offset=0&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&translatedLanguage[]=en&order[readableAt]=desc`)
		
		return response.data.data;
	}

	public verifyIfListGotNewMangas = async () => {
	
		const chaptersListFeed = await this.getFeedList();

		const filterNewChapters = chaptersListFeed.filter((item) => this.checkIfItIsANewChapter(item));
		
		if (!filterNewChapters.length) {
			throw new Error("List Ain't got new chapters");
		}
		
		const mangaIds = this.findAllMangasOfChapters(filterNewChapters);

		await this.createAllMangaEmbedsForNewChapters(filterNewChapters, mangaIds);
	};

	private promiseDelayer = async (seconds: number) => {

		await new Promise((resp) => setTimeout(() => resp(null), seconds * 1000));
	
	};

	private findAllMangasOfChapters = (chapters: types.IMangadexChapter[]): string[] => {

		const allRelations = chapters.map((item) => item.relationships.filter(relation => relation.type === "manga")[0].id);

		const UniqueIdsSet = new Set(allRelations);

		return Array.from(UniqueIdsSet);
	}

	private createAllMangaEmbedsForNewChapters = async (newChapters: types.IMangadexChapter[], mangaIds: string[]) => {

		await Promise.all(mangaIds.map(async (mangaId, index) => {

			await this.promiseDelayer(5 * index);	

			const chapters = this.findAllMangaChapters(newChapters, mangaId);

			const manga = await this.getSimplifiedManga(mangaId);

			this.addInUpdatedMangaList(mangaId, chapters[0].attributes.chapter);

			this.createChapterMangaEmbed(chapters, manga);

		}))
	}

	private findAllMangaChapters = (chapters: types.IMangadexChapter[], mangaId: string): types.IMangadexChapter[] => {

		const getMangaRelation = (relationsShips: types.MangaRelationBase[]): types.MangaRelationBase => {
			return relationsShips.filter((item) => item.type === "manga")[0];
		} 
		return chapters.filter((item) => getMangaRelation(item.relationships).id === mangaId);
	}

	public clearAll = () => {
		this.mangaList = [];
		this.updatedMangaList = [];
	};
};
