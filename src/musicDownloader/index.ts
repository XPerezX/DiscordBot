import ytdl from "ytdl-core";

console.log("rodi");


const convertMusic = () => {
    
    ytdl("https://www.youtube.com/watch?v=LvyX8JqI_oc&ab_channel=gMAFIapRo",
{ filter: "audioonly" });
};

