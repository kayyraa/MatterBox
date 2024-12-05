const Api = window.Api;

const AudioElement = document.createElement("audio");
document.body.appendChild(AudioElement);

const Playback = [];
const Commands = [
    "!upload",
    "!play",
    "!stop",
    "!list",
    "!playback"
];
Api.ConsoleInput.addEventListener("keydown", async (Event) => {
    if (Event.key === "Enter") {
        const Command = String(Api.ConsoleInput.value).toLowerCase().split(" ")[0];
        const Args = String(Api.ConsoleInput.value).toLowerCase().split(" ");

        if (Commands.includes(Command)) {
            if (Command === "!upload") {
                const UploadPrompt = document.createElement("input");
                UploadPrompt.type = "file";
                UploadPrompt.accept = "audio/*";
                UploadPrompt.addEventListener("change", async () => {
                    const File = UploadPrompt.files[0];
                    if (!File) {
                        Api.DevConsole.Write("No file selected.");
                        return;
                    }
    
                    const { data: Data, error: Error } = await Api.Supabase.storage.from("MediaBucket").upload(File.name, File);
                    if (Error) {
                        Api.DevConsole.Write("Failed to upload audio file.");
                        return;
                    } else {
                        Api.DevConsole.Write("Successfully uploaded audio to the cloud.");
                    }
                });
    
                setTimeout(() => {
                    UploadPrompt.click();
                }, 0);
            } else if (Command === "!play") {
                const AudioFileName = Args[1];
                if (!AudioFileName) {
                    if (!(Playback.length > 0)) {
                        Api.DevConsole.Write("Please specify the audio file name.");
                        return;
                    } else {
                        const { data: Data, error: Error } = await Api.Supabase.storage.from("MediaBucket").download(Playback[0]);
                        if (!Error && Data) {
                            AudioElement.src = URL.createObjectURL(Data);
                            AudioElement.play();
                        }
                    }
                }
    
                const { data: Data, error: Error } = await Api.Supabase.storage.from("MediaBucket").download(AudioFileName);
                if (Error) {
                    Api.DevConsole.Write("Failed to find audio file in the cloud.");
                    return;
                } else if (Data) {
                    Playback.push(AudioFileName);
                    AudioElement.src = URL.createObjectURL(Data);
                    AudioElement.play();
                }
            } else if (Command === "!stop") {
                AudioElement.pause();
            } else if (Command === "!playback") {
                if ([...Args[1]].some(Character => "0123456789".includes(Character))) {
                    AudioElement.currentTime = parseInt(Args[1]);
                } else if (Args[1] === "clear") {
                    Playback.length = 0;
                    AudioElement.pause();
                    AudioElement.src = "";
                    AudioElement.load();
                    Api.DevConsole.Write("Playback history cleared and audio stopped.");
                    return;
                }
            } else if (Command === "!list") {
                if (Args[1] === "playback") {
                    Api.DevConsole.Write("Playback history:");
                    Playback.forEach((URL, Index) => {
                        Api.DevConsole.Write(`- ${Index + 1}. ${URL.split("/").pop()}`);
                    });
                } else {
                    const { data: Data, error: Error } = await Api.Supabase.storage.from("MediaBucket").list();
                    if (Error) {
                        Api.DevConsole.Write("Error listing media files:", Error.message);
                    } else {
                        Api.DevConsole.Write("Audio files in the bucket:");
                        Data.filter((File) => {
                            return /\.(mp3|wav|ogg)$/i.test(File.name);
                        }).forEach((AudioFile) => {
                            Api.DevConsole.Write(AudioFile.name);
                        });
                    }
                }
            }

            setTimeout(() => {
                document.querySelector(".Console").style.display = "block !important";
            }, 125);
        }
    }
});