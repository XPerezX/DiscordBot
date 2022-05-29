const strings = {
	errors: {
		theresAError: "Ocorreu um erro",
		alreadyInAVoiceChannel: "Você não está em nenhuma sala",
		nothingToSearch: "É necessário nome ou link para encontrar a música",
		cannotFindSong: "Não foi possível encontrar a música",
		theresNothingInQueue: "Não tem músicas na queue",
		cannotFindCommand: "Comando não existe",
		console: {
			cronError: "[Error - Cron Job]: ",
		},
	},
	success: {
		songWasAddedIntoPlayList: "Música adicionada a playlist",
		skipSong: "Pulando Música",
		startPlaySong: (musicName: string) => `Começando a tocar ${musicName}`,
	},
	commands: {
		seeQueue: {
			list: "Lista:"
		},
	},
	services: {
		manga: {
			mangaUrl: (mangaId: string) => `https://mangadex.org/title/${mangaId}`,
			mangaImage: (mangaId: string, cover_art_fileName: string) => `https://uploads.mangadex.org/covers/${mangaId}/${cover_art_fileName}`,
			chapterLink: (chapter: string, chapterId: string, title?: string) => `**[${chapter} ${title ? "- " + title : ""}](https://mangadex.org/chapter/${chapterId}/1)**`,
		},
	},
};

export default strings;