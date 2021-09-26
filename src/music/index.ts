import { VoiceConnection } from "@discordjs/voice";
import ytdl from "ytdl-core";

console.log("rodi");


export const convertMusic = () => {
    
   const yd = ytdl("https://www.youtube.com/watch?v=f8Iom8RUOJY&t=167s&ab_channel=Cl%C3%A9sioNadson", { filter: "audioonly" });
   console.log(yd.readable);
   return yd;
};

export default convertMusic();

