import * as Api from "./api.js";

const UsernameLabel = document.querySelector(".Username");
const ModTitleInput = document.querySelector(".ModTitleInput");
const ModContentInput = document.querySelector(".ModContentInput");
const ModSubmitButton = document.querySelector(".ModSubmitButton");
const LogOutButton = document.querySelector(".LogOutButton");
const UploadPrompt = document.querySelector(".UploadPrompt");
const ModList = document.querySelector(".ModList");

const Supabase = Api.Supabase;

const HandleLoggedIn = (User) => {
    UsernameLabel.innerHTML = User.Username;
};

const HandleNotLoggedIn = () => {
    location.href = "../account.html";
};

const FetchMods = async () => {
    const { data: Mods, error: FetchError } = await Supabase.from("SharedMods").select("*");
    if (FetchError) return;

    const ModsArray = Mods || [];
    ModsArray.forEach(Mod => {
        const ModElement = document.createElement("div");
        ModList.appendChild(ModElement);

        const ModAuthorLabel = document.createElement("span");
        ModAuthorLabel.innerHTML = `${Mod.Author} -`;
        ModElement.appendChild(ModAuthorLabel);

        const ModHeader = document.createElement("header");
        ModHeader.innerHTML = Mod.Title;
        ModElement.appendChild(ModHeader);

        const ButtonContainer = document.createElement("div");
        ButtonContainer.classList.add("ButtonContainer");
        ModElement.appendChild(ButtonContainer);

        const ActionsButton = document.createElement("button");
        ActionsButton.innerHTML = "ACTIONS >";
        ActionsButton.style.order = "-1";
        ButtonContainer.appendChild(ActionsButton);

        const ViewContentButton = document.createElement("button");
        ViewContentButton.innerHTML = "VIEW CONTENT";
        ViewContentButton.addEventListener("click", () => {
            const CodeBlob = new Blob([Mod.Content], { type: "application/javascript" });
            const Url = URL.createObjectURL(CodeBlob);
            location.href = Url;
            setTimeout(() => URL.revokeObjectURL(Url), 0);
        });
        ButtonContainer.appendChild(ViewContentButton);

        const DownloadFileModButton = document.createElement("button");
        DownloadFileModButton.innerHTML = "DOWNLOAD FILE";
        DownloadFileModButton.addEventListener("click", () => {
            const AnchorBlob = new Blob([Mod.Content], { type: "application/octet-stream" });
            const AURL = URL.createObjectURL(AnchorBlob);
            const Anchor = document.createElement("a");
            Anchor.href = AURL;
            Anchor.download = `${Mod.Title}.js`;
            document.body.appendChild(Anchor);
            Anchor.click();
            Anchor.remove();
        });
        ButtonContainer.appendChild(DownloadFileModButton);

        const DownloadToGameModButton = document.createElement("button");
        DownloadToGameModButton.innerHTML = "DOWNLOAD TO GAME";
        DownloadToGameModButton.addEventListener("click", () => {
            const Mods = JSON.parse(localStorage.getItem("Mods")) || [];

            const ExistingMod = Mods.find(Item => Item.Name === String(Mod.Title).trim());
            if (ExistingMod) {
                ExistingMod.Content = Mod.Content;
                ExistingMod.Enabled = true;
            } else {
                Mods.push({ Name: String(Mod.Title).trim(), Content: Mod.Content, Enabled: true });
            }
        
            localStorage.setItem("Mods", JSON.stringify(Mods));
        });
        ButtonContainer.appendChild(DownloadToGameModButton);

        if (JSON.parse(localStorage.getItem("User")).Username === Mod.Author) {
            const UpdateButton = document.createElement("button");
            UpdateButton.innerHTML = "UPDATE MOD";
            UpdateButton.addEventListener("click", async () => {
                ModTitleInput.value = Mod.Title;
                ModContentInput.value = Mod.Content;
                UploadPrompt.style.display = "flex";

                ModSubmitButton.addEventListener("click", () => {
                    const Mods = JSON.parse(localStorage.getItem("Mods")) || [];

                    const ExistingMod = Mods.find(Item => Item.Name === String(Mod.Title).trim());
                    if (ExistingMod) {
                        ExistingMod.Content = ModContentInput.value;
                        ExistingMod.Enabled = true;
                    }
                
                    localStorage.setItem("Mods", JSON.stringify(Mods));
                });
            });
            ButtonContainer.appendChild(UpdateButton);
        }
        
        Array.from(ButtonContainer.children).forEach(Button => {
            if (Button !== ActionsButton) Button.style.display = "none";
        });
        ActionsButton.addEventListener("click", () => {
            Array.from(ButtonContainer.children).forEach(Button => {
                if (Button !== ActionsButton) Button.style.display = getComputedStyle(Button).display === "none" ? "" : "none";
                if (Button !== ActionsButton) {
                    if (getComputedStyle(Button).display === "none") {
                        ActionsButton.innerHTML = "ACTIONS >";
                    } else {
                        ActionsButton.innerHTML = "ACTIONS <";
                    }
                }
            });
        });

        const ModTimestampLabel = document.createElement("span");
        ModElement.appendChild(ModTimestampLabel);

        const DateObj = new Date(Mod.Timestamp * 1000);
        const Day = String(DateObj.getDate()).padStart(2, '0');
        const Month = String(DateObj.getMonth() + 1).padStart(2, '0');
        const Year = DateObj.getFullYear();
        ModTimestampLabel.innerHTML = `Updated: ${Day}.${Month}.${Year}`;
    });
};

ModSubmitButton.addEventListener("click", async () => {
    const ModTitle = ModTitleInput.value;
    const ModContent = ModContentInput.value;

    if (!ModTitle || !ModContent) return;

    const { data: Data, error: Error } = await Supabase.from("SharedMods").select("*").eq("Title", ModTitle).single();

    if (!Data) {
        const NewModData = {
            Title: ModTitle,
            Content: ModContent,
            Author: JSON.parse(localStorage.getItem("User")).Username,
            Timestamp: Math.floor(Date.now() / 1000)
        };

        const { error: InsertError } = await Supabase.from("SharedMods").insert(NewModData);
        if (!InsertError) location.reload();
    } else {
        const UpdatedModData = {
            Title: ModTitle,
            Content: ModContent,
            Author: JSON.parse(localStorage.getItem("User")).Username,
            Timestamp: Math.floor(Date.now() / 1000)
        };

        const { error: UpdateError } = await Supabase.from("SharedMods").update(UpdatedModData).eq("Title", ModTitle);
        if (!UpdateError) location.reload();
    }
});

LogOutButton.addEventListener("click", () => {
    localStorage.removeItem("User");
    location.reload();
});

document.addEventListener("DOMContentLoaded", async () => {
    const LocalUser = localStorage.getItem("User");
    FetchMods();

    if (LocalUser) {
        const { data: Data, error: Error } = await Api.Supabase
            .from("Users")
            .select("*")
            .eq("Username", JSON.parse(LocalUser).Username)
            .single();

        if (!Error) HandleLoggedIn(Data);
        else HandleNotLoggedIn();
    } else {
        HandleNotLoggedIn();
    }
});