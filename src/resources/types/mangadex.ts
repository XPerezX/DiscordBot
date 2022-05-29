export interface IMangadexResponse<DataType> {
	result: string,
	response: string,
	data: DataType
}

type ICustomListRelantionTypes = "user" | "manga";

export interface IMangadexCustomList {
    id: string;
    type: "custom_list";
    attributes: {
        name: string,
        visibility: string;
        version: number;
    },
    relationships: Array<{
        id: string;
        type: ICustomListRelantionTypes;
    }>
}

export interface IMangadexManga {
    id: string;
    type: "manga";
    attributes: {
        title: Record<string | "en" | "fr" | "pt-br" | "fr", string>;
        altTitles: any[];
        description: Record<string | "en" | "fr" | "pt-br" | "fr", string>;
        originalLanguage: string;
        lastVolume: string;
        lastChapter: string;
        publicationDemographic: "shounen";
        status: "shounen" | "shoujo" | "josei" | "seinen" | boolean;
        year: number,
        contentRating: "safe"| "suggestive"| "erotica"| "pornographic";
        tags: any[];
        state: "draft" | "submitted" | "published" | "rejected";
        chapterNumbersResetOnNewVolume: boolean;
        createdAt: Date;
        updatedAt: Date;
        version: number;
        availableTranslatedLanguages: string[]
    },
    relationships: IMangadexCoverArt[]
}

interface IMangadexCoverArt {
    id: string;
    type: "cover_art";
    attributes: {
        description: string;
        volume: string;
        fileName: string;
        locale: any,
        createdAt: Date;
        updatedAt: Date;
        version: number;
    }
}

type IChapterRelationType = "manga" | "user" | "scanlation_group";

export interface MangaRelationBase {
    id: string;
    type: IChapterRelationType;
};

export interface IMangadexChapter {
    id: string;
    type: "chapter";
    attributes: {
        volume?: boolean | string;
        chapter: string;
        title: string | null;
        translatedLanguage: "en" | "pt-br" | "ja";
        externalUrl: null | string;
        publishAt: Date;
        readableAt: Date;
        createdAt: Date;
        updatedAt: Date;
        pages: number;
        version: number;
    },
    relationships: Array<
        {
            id: string;
            type: IChapterRelationType;
        }
    >;
}

export interface ISimplifiedManga {
    id: string;
    title: string;
    image: string;
    description: string;
}

export interface UpdatedMangaList {
    id: string;
    latestChapter: string;
}

interface IMangadexScan {
	id: string;
	type: string;
	attributes: {
		name: string;
		altNames: [
			{
				en: string;
			}
		],
		locked: boolean,
		website: string,
		ircServer: string,
		ircChannel: string | null,
		discord: string,
		contactEmail: string;
		description: string;
		twitter: string | null;
		mangaUpdates: string | null;
		focusedLanguages: string[];
		official: boolean,
		verified: boolean,
		inactive: boolean,
		publishDelay: null,
		createdAt: Date,
		updatedAt: Date,
		version: number
	}
}