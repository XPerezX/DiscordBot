import { CommandInteraction } from "discord.js";

import { playMusic } from "./PlayMusic";
import { skipMusic } from "./SkipMusic";
import { seeQueue } from "./SeeQueue";

const Commands: Record<string, (interaction: CommandInteraction) => void> = {
	p: playMusic,
	s: skipMusic,
	queue: seeQueue,
};

export default Commands;
