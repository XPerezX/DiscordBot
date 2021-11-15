
import { CommandInteraction } from "discord.js";
import { player } from "../../resources/globalData";


export const playMusic = (interaction: CommandInteraction) => {
    const interactionUserChannel = interaction.guild?.members.cache.find((user) => user.id === interaction.user.id)?.voice.channel;

	player.playCommand(interaction, interactionUserChannel);
};