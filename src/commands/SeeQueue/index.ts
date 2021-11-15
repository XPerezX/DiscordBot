
import { CommandInteraction } from "discord.js";
import { player } from "../../resources/globalData";
import strings from "../../resources/strings";

export const seeQueue = async (interaction: CommandInteraction) => {

    if(!player.queueHandler.list.length) {
        return await interaction.reply(strings.errors.theresNothingInQueue);
    }

    const title = strings.commands.seeQueue.list;
    const playList = player.queueHandler.list.map((item, index) => `${index + 1}º ${item.title ? item.title: "No named"}`);
    playList.unshift(title);
    await interaction.reply(playList.join("\n"));
};