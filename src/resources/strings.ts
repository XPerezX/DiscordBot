const strings = {
	errors: {
		theresAError: "Ocorreu um erro",
		alreadyInAVoiceChannel: "Você não está em nenhuma sala",
		nothingToSearch: "É necessário nome ou link para encontrar a música",
		cannotFindSong: "Não foi possível encontrar a música",
		theresNothingInQueue: "Não tem músicas na queue",
		cannotFindCommand: "Comando não existe",
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
};

export default strings;