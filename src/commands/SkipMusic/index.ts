
import { CommandInteraction } from "discord.js";

import { player } from "../../resources/globalData";
import strings from "../../resources/strings";

export const skipMusic = async (interaction: CommandInteraction) => {
    player.skipCommand();
    await interaction.reply(strings.success.skipSong);
};