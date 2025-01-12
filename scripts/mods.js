import * as Api from "./api.js";

const Mods = JSON.parse(localStorage.getItem("Mods")) || [];
const LastMods = JSON.parse(localStorage.getItem("LastMods")) || [];
Mods.forEach(Mod => {
    if (Mod.Enabled) {
        eval(Mod.Content);
    }

    const ModItem = document.createElement("div");
    Api.ModsManager.querySelector(".Mods").appendChild(ModItem);

    const ModHeader = document.createElement("header");
    ModHeader.innerHTML = Mod.Name;
    ModItem.appendChild(ModHeader);

    const ModSettings = document.createElement("div");
    ModItem.appendChild(ModSettings);

    const ModEnabledLabel = document.createElement("span");
    ModEnabledLabel.innerHTML = Mod.Enabled ? "Enabled" : "Disabled";
    ModEnabledLabel.style.color = Mod.Enabled ? "rgb(0, 255, 0)" : "rgb(255, 0, 0)";
    ModEnabledLabel.style.setProperty("--Color", Mod.Enabled ? "rgba(120, 255, 120, 0.125)" : "rgba(255, 120, 120, 0.2)");
    ModSettings.appendChild(ModEnabledLabel);

    const ModToggleButton = document.createElement("button");
    ModToggleButton.innerHTML = "Toggle";
    ModToggleButton.addEventListener("click", () => {
        Mod.Enabled = !Mod.Enabled;
        ModEnabledLabel.innerHTML = Mod.Enabled ? "Enabled" : "Disabled";
        ModEnabledLabel.style.color = Mod.Enabled ? "rgb(120, 255, 120)" : "rgb(255, 0, 0)";
        ModEnabledLabel.style.setProperty("--Color", Mod.Enabled ? "rgba(120, 255, 120, 0.125)" : "rgba(255, 120, 120, 0.2)");
        ModWarnLabel.style.opacity = "1";
        localStorage.setItem("Mods", JSON.stringify(Mods));
    });
    ModSettings.appendChild(ModToggleButton);

    const ModViewButton = document.createElement("button");
    ModViewButton.innerHTML = "View Content";
    ModViewButton.addEventListener("click", () => {
        const CodeBlob = new Blob([Mod.Content], { type: "application/javascript" });
        const Url = URL.createObjectURL(CodeBlob);
        location.href = Url;
        setTimeout(() => URL.revokeObjectURL(Url), 0);
    });
    ModSettings.appendChild(ModViewButton);

    const ModRemoveButton = document.createElement("button");
    ModRemoveButton.innerHTML = "Remove";
    ModRemoveButton.style.color = "rgb(255, 0, 0)";
    ModRemoveButton.addEventListener("click", () => {
        const Mods = JSON.parse(localStorage.getItem("Mods")) || [];
        const Index = Mods.findIndex(Item => Item.Name === Mod.Name);
        if (Index !== -1) {
            Mods.splice(Index, 1);
            localStorage.setItem("Mods", JSON.stringify(Mods));
            ModWarnLabel.style.opacity = "1";
        }
    });    
    ModSettings.appendChild(ModRemoveButton);

    const ModWarnLabel = document.createElement("span");
    ModWarnLabel.innerHTML = "*Restart to apply changes";
    ModWarnLabel.style.opacity = "0";
    ModSettings.appendChild(ModWarnLabel);
});

function ArrayCompare(Arr1, Arr2) {
    if (
      !Array.isArray(Arr1)
      || !Array.isArray(Arr2)
      || Arr1.length !== Arr2.length
    ) return false;

    for (let Index = 0; Index < Arr1.length; Index++) {
        const Element1 = Arr1[Index];
        const Element2 = Arr2[Index];

        if (typeof Element1 === "object" && typeof Element2 === "object") {
            if (!ObjectCompare(Element1, Element2)) return false;
        } else if (Element1 !== Element2) return false;
    }

    return true;
}

function ObjectCompare(Obj1, Obj2) {
    if (Obj1.Name !== Obj2.Name) return false;
    return true;
}

if (!ArrayCompare(LastMods, Mods)) {
    let ContentMessage = "";

    if (LastMods.length > Mods.length) ContentMessage = `${Math.abs(LastMods.length - Mods.length)} mod${Math.abs(LastMods.length - Mods.length) > 1 ? "s" : ""} removed.`;  
    else ContentMessage = `${Math.abs(LastMods.length - Mods.length)} new mod${Math.abs(LastMods.length - Mods.length) > 1 ? "s" : ""} added.`;

    new Api.Notification({
        Title: "Mod Manager",
        Content: ContentMessage,
        Timestamp: Math.floor(new Date() / 1000),
        Options: {
            AutoClose: {
                Enabled: true,
                Timer: 2500
            },
            CloseIcon: "X",
        }
    }).Append();

    localStorage.setItem("LastMods", JSON.stringify(Mods));
}

let Minimized = false;
Api.ModsMinimizeButton.addEventListener("click", () => {
    Minimized = !Minimized;

    if (Minimized) {
        Api.ModsManager.querySelector(".Mods").style.display = "none";
        Api.ModsManager.style.height = "24px";
        Api.ModsManager.style.width = "25%";

        let Dragging = false;
        Api.ModsManager.addEventListener("mousedown", Event => {
            if (Event.target.offsetParent === Api.ModsManager.querySelector(".Topbar")) Dragging = true;
        });

        document.addEventListener("mousemove", Event => {
            if (Dragging && Minimized) {
                Api.ModsManager.style.left = `${Event.clientX}px`;
                Api.ModsManager.style.top = `${Event.clientY}px`;
            }
        });

        document.addEventListener("mouseup", () => {
            Dragging = false;
        });
    } else {
        Api.ModsManager.querySelector(".Mods").style.display = "";
        Api.ModsManager.style.height = "";
        Api.ModsManager.style.width = "";
        Api.ModsManager.style.left = "";
        Api.ModsManager.style.top = "";
    }
});