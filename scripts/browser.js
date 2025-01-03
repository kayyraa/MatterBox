import * as Api from "./api.js";

const UsernameLabel = document.querySelector(".Username");
const ModTitleInput = document.querySelector(".ModTitleInput");
const ModContentInput = document.querySelector(".ModContentInput");
const ModSearchInput = document.querySelector(".ModSearchInput");
const UserSearchInput = document.querySelector(".UserSearchInput");
const ModSubmitButton = document.querySelector(".ModSubmitButton");
const OffensiveButton = document.querySelector(".OffensiveButton");
const ClearFilterButton = document.querySelector(".ClearFilterButton");
const LogOutButton = document.querySelector(".LogOutButton");
const UploadPrompt = document.querySelector(".UploadPrompt");
const FilterElement = document.querySelector(".Filter").querySelector("a");
const ModList = document.querySelector(".ModList");

const Supabase = Api.Supabase;
let IsOffensive = false;

const HandleLoggedIn = (User) => {
    UsernameLabel.innerHTML = User.Username;
};

const HandleNotLoggedIn = () => {
    location.href = "../account.html";
};

async function FetchMods(
    Filter = {
        SpecificUser: "",
        SpecificModTitle: ""
    }
) {
    const { data: Mods, error: FetchError } = await Supabase.from("SharedMods").select("*");
    if (FetchError) return;

    ModList.querySelectorAll("div[style*='order']").forEach(Element => Element.remove());

    const ModsArray = Mods || [];
    ModsArray.forEach(Mod => {
        if (Filter) {
            let FilterDescription = "Filter:";
            Object.keys(Filter).forEach(Key => {
                if (Filter[Key]) {
                    FilterDescription += ` ${Key.charAt(0).toUpperCase() + Key.slice(1)}: ${Filter[Key]}`;
                }
            });
            FilterElement.innerHTML = FilterDescription === "Filter:" ? "Filter: None" : FilterDescription;
        }

        if (Filter?.SpecificUser     && Mod.Author    !== Filter?.SpecificUser)         return;
        if (Filter?.SpecificModTitle && Mod.Title     !== Filter?.SpecificModTitle) return;

        const ModElement = document.createElement("div");
        ModElement.style.order = Mod.Timestamp;
        ModList.appendChild(ModElement);

        const ModAuthorLabel = document.createElement("a");
        ModAuthorLabel.innerHTML = Mod.Author;
        ModAuthorLabel.classList.add("Author");
        ModAuthorLabel.addEventListener("click", () => {
            ModList.querySelectorAll("div[style*='order']").forEach(Element => Element.remove());
            FetchMods({
                SpecificUser: Mod.Author
            });
        });
        ModElement.appendChild(ModAuthorLabel);
        ModElement.innerHTML = ModElement.innerHTML + "<div> - </div>";

        const ModHeader = document.createElement("header");
        ModHeader.innerHTML = Mod.Title;
        ModElement.appendChild(ModHeader);

        if (Mod.Offensive) {
            const OffensiveBadge = document.createElement("img");
            OffensiveBadge.src = "../images/Warning.svg";
            OffensiveBadge.title = "This mod is offensive";
            ModElement.appendChild(OffensiveBadge);
        }

        const ButtonContainer = document.createElement("div");
        ButtonContainer.classList.add("ButtonContainer");
        ModElement.appendChild(ButtonContainer);

        const ActionsButton = document.createElement("button");
        ActionsButton.innerHTML = "ACTIONS >";
        ActionsButton.style.order = "-1";
        ButtonContainer.appendChild(ActionsButton);

        const ViewContentButton = document.createElement("button");
        ViewContentButton.innerHTML = "CONTENT";
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
        DownloadToGameModButton.innerHTML = "DOWNLOAD";
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
            UpdateButton.innerHTML = "UPDATE";
            UpdateButton.addEventListener("click", async () => {
                IsOffensive = Mod.Offensive;
                OffensiveButton.innerHTML = IsOffensive ? "Offensive?: YES" : "Offensive?: NO";

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

            const RemoveButton = document.createElement("button");
            RemoveButton.innerHTML = "REMOVE";
            RemoveButton.style.color = "rgb(255, 0, 0)";
            RemoveButton.addEventListener("click", async () => {
                await Supabase.from("SharedMods").delete().eq("Title", Mod.Title);
                location.reload();
            });            
            ButtonContainer.appendChild(RemoveButton);
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
        const Minutes = String(DateObj.getMinutes()).padStart(2, "0");
        const Hours = String(DateObj.getHours()).padStart(2, "0");
        const Day = String(DateObj.getDate()).padStart(2, "0");
        const Month = String(DateObj.getMonth() + 1).padStart(2, "0");
        const Year = DateObj.getFullYear();
        ModTimestampLabel.innerHTML = `${Hours}:${Minutes} / ${Day}.${Month}.${Year}`;
    });
};

ClearFilterButton.addEventListener("click", () => FetchMods());

OffensiveButton.addEventListener("click", () => {
    IsOffensive = !IsOffensive;
    OffensiveButton.innerHTML = IsOffensive ? "Offensive?: YES" : "Offensive?: NO";
});

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
            Offensive: IsOffensive,
            Timestamp: Math.floor(Date.now() / 1000)
        };

        const { error: InsertError } = await Supabase.from("SharedMods").insert(NewModData);
        if (!InsertError) location.reload();
    } else {
        const UpdatedModData = {
            Title: ModTitle,
            Content: ModContent,
            Author: JSON.parse(localStorage.getItem("User")).Username,
            Offensive: IsOffensive,
            Timestamp: Data.Timestamp
        };

        const { error: UpdateError } = await Supabase.from("SharedMods").update(UpdatedModData).eq("Title", ModTitle);
        if (!UpdateError) location.reload();
    }
});

LogOutButton.addEventListener("click", () => {
    localStorage.removeItem("User");
    location.reload();
});

ModSearchInput.addEventListener("keydown", (Event) => {
    if (Event.key === "Enter") FetchMods({SpecificModTitle: ModSearchInput.value});
});

UserSearchInput.addEventListener("keydown", (Event) => {
    if (Event.key === "Enter") FetchMods({SpecificUser: UserSearchInput.value});
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