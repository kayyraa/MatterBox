import * as Api from "./api.js";
import * as Ambient from "./ambient.js";

var Dragging = false;
var Removing = false;

var Lining = false;

var LineStartX = 0;
var LineStartY = 0;
var LineEndX = 0;
var LineEndY = 0;

var CursorRadius = 0;

var Mouse = {
    clientX: 0,
    clientY: 0,
    target: null
};

const GridSize = window.GridSize;

var Position = { X: 736, Y: 304, Snapped: true };
var xMin = -50;
var xMax = 50;
var yMin = -50;
var yMax = 50;

document.addEventListener("mouseleave", () => {
    Api.CursorElement.style.opacity = 0;
});

document.addEventListener("mouseenter", () => {
    Api.CursorElement.style.opacity = 1;
});

document.addEventListener("contextmenu", Event => {
    Event.preventDefault();
}, { passive: false });

function PlaceParticle(MouseEvent) {
    const CenterX = Math.round((Api.CursorElement.offsetLeft - GridSize / 2) / GridSize) * GridSize;
    const CenterY = Math.round((Api.CursorElement.offsetTop - GridSize / 2) / GridSize) * GridSize;

    if (MouseEvent.target === Api.ParticleContainer || (MouseEvent.target.offsetParent && MouseEvent.target.offsetParent === Api.ParticleContainer) && MouseEvent.clientY < Api.ParticleContainer.innerHeight) {
        for (let OffsetX = -CursorRadius; OffsetX <= CursorRadius; OffsetX++) {
            for (let OffsetY = -CursorRadius; OffsetY <= CursorRadius; OffsetY++) {
                const Distance = Math.sqrt(OffsetX * OffsetX + OffsetY * OffsetY);
                if (Distance <= CursorRadius) {
                    const GridX = CenterX + OffsetX * GridSize;
                    const GridY = CenterY + OffsetY * GridSize;

                    if (Dragging) {
                        if (Removing || window.ElementSelection.Name === "NONE" && Api.Particle.IsPlaceOccupied(GridX, GridY)) {
                            Api.Particle.RemovePartFromPosition(GridX, GridY);
                        } else if (!Removing && !Api.Particle.IsPlaceOccupied(GridX, GridY) && window.ElementSelection?.Name !== "NONE") {
                            Api.Particle.GeneratePart({ X: GridX, Y: GridY, Snapped: true }, window.ElementSelection);
                        }
                    }
                }
            }
        }
    }
}

function MouseDown(Event) {
    if (Event.button === 2) Removing = true;
    if (Event.shiftKey) {
        LineStartX = Event.clientX;
        LineStartY = Event.clientY;
        Lining = true;
    }

    if (Event.button === 1) window.ElementSelection = Api.Particle.GetElement(String(Event.target.getAttribute("Name").replaceAll('"', '')));
    if (Event.button === 0 || Event.button === 2) Dragging = true;
}

document.addEventListener("wheel", Event => {
    if (Event.shiftKey) {
        if (Event.deltaY > 0) CursorRadius = Math.max(0, CursorRadius - 1);
        else CursorRadius = Math.min(8, CursorRadius + 1);
    }
});

document.addEventListener("mousedown", Event => {
    MouseDown(Event);
    if (Event.button === 2) Removing = true;
});

document.addEventListener("mouseup", Event => {
    Mouse.clientX = Event.clientX;
    Mouse.clientY = Event.clientY;
    Mouse.target = Event.target;

    if (window.ElementSelection && Lining) {
        LineEndX = Event.clientX;
        LineEndY = Event.clientY;
        const Element = Api.Particle.GetElement(window.ElementSelection.Name);
        if (Element && !Removing) Api.Particle.DrawLineParticle(Element, LineStartX, LineStartY, LineEndX, LineEndY, CursorRadius * 8);
        else if (Element && Removing) Api.Particle.DrawLineParticle(Api.Particle.GetElement("NONE"), LineStartX, LineStartY, LineEndX, LineEndY, CursorRadius * 8);
    } else {
        LineEndX = 0;
        LineEndY = 0;
    }

    Api.Particle.ClearLinePlaceholder();
    Lining = false;
    Dragging = Removing = false;
});

document.addEventListener("mousemove", Event => {
    Mouse.clientX = Event.clientX;
    Mouse.clientY = Event.clientY;
    Mouse.target = Event.target;
});

document.addEventListener("keydown", Event => {
    if (Event.key === "Escape") {
        Api.Console.style.display = "";
    }

    if (Api.IsUserInteracting()) return;
    if (Event.shiftKey || Event.altKey || Event.metaKey || Event.ctrlKey) return;

    const Key = String(Event.key).toUpperCase();
    if (Key === "C") {
        Api.ParticleContainer.innerHTML = "";
        Ambient.SuperSetEvery([["Temp", String(window.AmbientSize)]]);
    } else if (Key === " ") {
        window.Playing = !window.Playing;
        document.querySelectorAll(".OnPause").forEach(N => N.style.display = window.Playing ? "none" : "");
    } else if (Key === "F") {
        window.Playing = true;
        setTimeout(() => {
            window.Playing = false;
        }, 16);
    } else if (Key === "X") {
        if (getComputedStyle(Api.Console).display == "none") {
            Api.Console.style.display = "block";
            Api.ConsoleInput.focus();
        } else {
            Api.Console.style.display = "";
        }
    } else if (Key === "D") {
        const CurrentIndex = window.Displays.indexOf(window.Display);
        let NewIndex = CurrentIndex + 1;
        if (NewIndex >= window.Displays.length) {
            NewIndex = 0;
        }
        window.Display = window.Displays[NewIndex];

        Api.DisplayLabel.innerHTML = `${window.Displays[NewIndex]} Display`;
        Api.DisplayLabel.style.opacity = "1";
        setTimeout(() => {
            Api.DisplayLabel.style.opacity = "";
        }, 250);
    }
});

document.addEventListener("touchstart", Event => {
    MouseDown(Event);
    const Touch = Event.touches[0];
    Mouse.clientX = Touch.clientX;
    Mouse.clientY = Touch.clientY;
    Mouse.target = Event.target;
    Dragging = true;
    PlaceParticle(Mouse);
});

document.addEventListener("touchmove", Event => {
    const Touch = Event.touches[0];
    Mouse.clientX = Touch.clientX;
    Mouse.clientY = Touch.clientY;
    Mouse.target = Event.target;
    Dragging = true;
    PlaceParticle(Mouse);
});

document.addEventListener("touchend", () => {
    Dragging = false;
});

document.addEventListener("touchcancel", () => {
    Dragging = false;
});

new Api.ClickAndHold(document.body, Event => {
    return;
    LineStartX = Event.clientX || 0;
    LineStartY = Event.clientY || 0;
    Lining = true;
});

document.addEventListener("dblclick", Event => {
    if (Event.target === Api.ParticleContainer || Event.target.offsetParent === Api.ParticleContainer) {
        LineStartX = Event.clientX || 0;
        LineStartY = Event.clientY || 0;
        Lining = true;
    }
});

var Megc = 0;
Api.MegcButton.addEventListener("click", Event => {
    if (Event.target !== Api.MegcButton) return;
    Megc++;
    if (Megc === 1) {
        Array.from(Api.MegcButton.children).forEach(Child => {
            Child.style.opacity = "1";
            Child.style.pointerEvents = "auto";
        });
        Api.MegcInput.focus();
        Api.MegcButton.style.backgroundColor = "white";
        Api.MegcButton.style.color = "black";
    } else if (Megc === 2) {
        Array.from(Api.MegcButton.children).forEach(Child => {
            Child.style.opacity = "";
            Child.style.pointerEvents = "";
        });
        Api.MegcInput.blur();
        Api.MegcButton.style.backgroundColor = "";
        Api.MegcButton.style.color = "";
        Megc = 0;
    }
});

Api.MegcPlayButton.addEventListener("click", () => {
    Api.Particle.Plot.DrawArithmeticParticleGraph(Api.MegcInput.value || "Math.sin(x)", Position, Api.Particle.GetElement(Api.MegcSelector.value), parseInt(Api.MegcMaxInput.value), xMin, xMax, yMin, yMax, parseFloat(Api.MegcStepInput.value), true);
});

Api.MegcClearButton.addEventListener("click", () => {
    document.querySelector(".DisplayParticleContainer").querySelectorAll("div").forEach(Item => Item.remove());
});

Api.MegcUndoButton.addEventListener("click", () => Api.Particle.Plot.EraseLastGraphExpression());

Api.MegcRedoButton.addEventListener("click", () => {
    if (Api.RedoStack.length > 0) {
        const LastRedoJob = Api.RedoStack.pop();
        LastRedoJob.Redo();
        Api.GraphJobs.push(LastRedoJob);
    }
});

Api.DisplayParticleContainer.style.background = "transparent";

Api.MegcGridButton.addEventListener("click", () => {
    const CurrentBackground = getComputedStyle(Api.DisplayParticleContainer).backgroundColor;
    Api.DisplayParticleContainer.style.background = (CurrentBackground === "rgba(0, 0, 0, 0)") ? "" : "transparent";
});

window.Api = Api;
window.Ambient = Ambient;

Api.ConsoleInput.addEventListener("keydown", (Event) => {
    if (Event.key === "Enter") {
        Api.Console.style.display = "";
        const Command = String(Api.ConsoleInput.value).toLowerCase().split(" ");
        const Value = String(Api.ConsoleInput.value).toLowerCase();
        if (Value.startsWith("mod")) {
            if (Command.includes("add")) {
                ModFileInput.click();
            }
        } else if (Value === "save") {
            const SaveData = [];
            Array.from(Api.ParticleContainer.children).forEach(Part => {
                SaveData.push({
                    Name: String(Part.getAttribute("Name")).replace(/['"]/g, ""),
                    Pos: [parseInt(Part.style.left.replace("px", "")), parseInt(Part.style.top.replace("px", ""))],
                });
            });

            const AnchorBlob = new Blob([JSON.stringify(SaveData)], { type: "text/plain" });
            const Url = URL.createObjectURL(AnchorBlob);
            const Anchor = document.createElement("a");
            Anchor.href = Url;
            Anchor.download = "simulation.json";
            Anchor.click();
            URL.revokeObjectURL(Url);
        } else if (Value === "load") {
            const LoadPrompt = document.createElement("input");
            LoadPrompt.type = "file";
            LoadPrompt.accept = ".json";
            LoadPrompt.onchange = () => {
                const File = LoadPrompt.files[0];
                const Reader = new FileReader();
                Reader.onload = () => {
                    const SavedData = Array.from(JSON.parse(Reader.result));
                    Api.ParticleContainer.innerHTML = "";
                    console.log(SavedData);
                    SavedData.forEach(Part => {
                        Api.Particle.GeneratePart(
                            {X: Part.Pos[0], Y: Part.Pos[1], Snapped: true},
                            Api.Particle.GetElement(Part.Name)
                        );
                    });
                };
                Reader.readAsText(File);
            };

            setTimeout(() => {
                LoadPrompt.click();
            }, 0);
        }
    }
});

Api.ConsoleButton.addEventListener("click", () => {
    if (getComputedStyle(Api.Console).display == "none") {
        Api.Console.style.display = "block";
        Api.ConsoleInput.focus();
    } else {
        Api.Console.style.display = "";
    }
});

Api.ModsButton.addEventListener("click", () => {
    if (getComputedStyle(Api.ModsManager).display == "none") {
        Api.ModsManager.style.display = "block";
    } else {
        Api.ModsManager.style.display = "none";
    }
});

function Loop() {
    if (Lining) Api.Particle.DrawLinePlaceholder(LineStartX, LineStartY, Mouse.clientX, Mouse.clientY, CursorRadius * 8);
    else if (!Lining && Dragging) PlaceParticle(Mouse);

    if (Mouse.target && Mouse.target.classList.contains("Particle")) {
        Api.PartStats.style.opacity = "1";
        Api.PartStats.querySelector(".Name").innerHTML = Mouse.target.getAttribute("Name").replace(/['"]/g, "");
        Api.PartStats.querySelector(".Temp").innerHTML = `${parseFloat(Mouse.target.getAttribute("Temp")).toFixed(1)}⁰C`;
        if (Mouse.target.hasAttribute("tmp")) {
            Api.PartStats.querySelector(".Tmp").innerHTML = (N => {
                const Suffixes = ["", "k", "M"];
                const I = Math.floor(Math.log10(N) / 3);
                return I >= 1 ? (N / Math.pow(1000, I)).toFixed(2) + Suffixes[I] : N;
            })(parseFloat(Mouse.target.getAttribute("tmp")));
        } else Api.PartStats.querySelector(".Tmp").innerHTML = "NOTMP";
        Api.PartStats.querySelector(".Color").style.backgroundColor = String(Mouse.target.getAttribute("Color").replace(/['"]/g, ""));
    } else {
        Api.PartStats.style.opacity = "0";
    }

    const Distance = Math.floor(Math.sqrt(
        Math.pow(Mouse.clientX - LineStartX, 2) +
        Math.pow(Mouse.clientY - LineStartY, 2)
    ) / window.GridSize);
    Api.LineDistanceLabel.innerHTML = `${Distance}d`;
    Api.SelectionLabel.innerHTML = window.ElementSelection ? window.ElementSelection.Name : "NONE";
    Api.CursorXPosLabel.innerHTML = `X${String(Math.floor((parseInt(String(Mouse.clientX))) / window.GridSize) * window.GridSize).padStart(4, "0")}`;
    Api.CursorYPosLabel.innerHTML = `Y${String(Math.floor((parseInt(String(Mouse.clientY))) / window.GridSize) * window.GridSize).padStart(4, "0")}`;
    Api.CursorRadiusLabel.innerHTML = `${CursorRadius !== 8 ? CursorRadius + 1 : CursorRadius}r`;
    Api.CursorLineLabel.innerHTML = `${LineStartX.toString()[0]}${LineStartY.toString()[0]}${String(Mouse.clientX)[0]}${String(Mouse.clientY)[0]}`;
    Api.CursorElement.style.left = `${Mouse.clientX}px`;
    Api.CursorElement.style.top = `${Mouse.clientY}px`;
    Api.CursorElement.style.width = `${(CursorRadius * (window.GridSize * 2)) + window.GridSize}px`;

    Array.from(window.Selector.children).forEach(Selector => {
        const MouseLeft = Mouse.clientX;
        const SelectorLeft = Selector.getBoundingClientRect().right;
        const SelectorWidth = Selector.offsetWidth;
        const ScrollableWidth = Selector.scrollWidth - SelectorWidth;

        const RelativeMousePosition = MouseLeft - SelectorLeft;
        const ScrollPosition = (RelativeMousePosition / SelectorWidth) * ScrollableWidth;

        Selector.scrollLeft = ScrollPosition;
    });

    setTimeout(Loop, 0);
}

Loop();