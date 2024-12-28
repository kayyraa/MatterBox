import { Elements, PartStates } from "./elements.js";
import * as Api from "./api.js";

window.Version = "v5.4.2";

window.GridSize = 16;
window.AmbientTemp = 22;
window.Effects = {
    Powder: {
        Enabled: true,
        Power: 10
    }
};
window.EdgeMode = "Solid";
window.Playing = true;
window.Displays = ["Fire", "Heat"];
window.Display = "Fire";

!localStorage.getItem("Mods") ? localStorage.setItem("Mods", "[]") : "";
!localStorage.getItem("LastMods") ? localStorage.setItem("LastMods", "[]") : "";
!localStorage.getItem("Version") ? localStorage.setItem("Version", window.Version) : "";

const SupabaseUrl = "https://ddsgdfouzkefwlhrtkej.supabase.co";
const SupabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkc2dkZm91emtlZndsaHJ0a2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDcwMzcsImV4cCI6MjA0ODk4MzAzN30.6WneV_JFV72tXpl721kfMcQxmJTRvh5y9SOjGJ77kxM";
export const Supabase = supabase.createClient(SupabaseUrl, SupabaseKey);

export const ElementsArray = Elements;

export const MegcInput = document.querySelector(".MEGCInput");
export const MegcStepInput = document.querySelector(".MEGCStepInput");
export const MegcMaxInput = document.querySelector(".MEGCMaxInput");
export const MegcPlayButton = document.querySelector(".MEGCButton");
export const MegcClearButton = document.querySelector(".MEGCClearButton");
export const MegcUndoButton = document.querySelector(".MEGCUndoButton");
export const MegcRedoButton = document.querySelector(".MEGCRedoButton");
export const MegcGridButton = document.querySelector(".MEGCGridButton");
export const MegcSelector = document.querySelector(".MEGCSelect");
export const MegcButton = document.querySelector(".MEGC");

export const PlaceholderContainer = document.querySelector(".PlaceholderContainer");
export const ParticleContainer = document.querySelector(".ParticleContainer");
export const DisplayParticleContainer = document.querySelector(".DisplayParticleContainer");

export const Console = document.querySelector(".Console");
export const ConsoleInput = document.querySelector(".ConsoleInput");
export const ConsoleButton = document.querySelector(".ConsoleButton");

export const ModsManager = document.querySelector(".ModsManager");
export const ModsButton = document.querySelector(".ModsButton");
export const ModsMinimizeButton = ModsManager?.querySelector(".ModsMinimizeButton");

export const Particles = [];
export const GraphJobs = [];
export const RedoStack = [];

export const Characters = "abcdefghijklmnopqrstuvwxyz"

export const CursorXPosLabel = document.querySelector(".CursorXPosLabel");
export const CursorYPosLabel = document.querySelector(".CursorYPosLabel");
export const CursorRadiusLabel = document.querySelector(".CursorRadiusLabel");
export const CursorLineLabel = document.querySelector(".CursorLineLabel");
export const SelectionLabel = document.querySelector(".ElementSelectionLabel");
export const DisplayLabel = document.querySelector(".DisplayLabel");
export const LineDistanceLabel = document.querySelector(".LineDistanceLabel");

export const SimulationSettingsList = document.querySelector(".SimulationSettingsList");

export const CursorElement = document.querySelector(".Cursor");
export const PartStats = document.querySelector(".PartStats");

export const Band = document.querySelector(".Band");

let NewElements = Elements;
export class Particle {
    static ReplaceParticle(Particle, Replacement) {
        const ReplacementElement = this.GetElement(Replacement);
        if (!ReplacementElement || !Particle) return;

        const Pos = JSON.parse(Particle.getAttribute("Pos"));
        this.GeneratePart(Pos, ReplacementElement, undefined, true);
        Particle.remove();
    }

    static AmalgamateParticle(Particle) {
        const NewParticle = this.GetElement(Particle.getAttribute("Name").replace(/['"]/g, ""));
        NewParticle.Name = `A${Particle.getAttribute("Name").replace(/['"]/g, "")}`
        this.ReplaceParticle(Particle, NewParticle);
    }

    static GetElement(Name) {
        return NewElements.find(Element => Element.Name === Name);
    }

    static GetSpecificParticles(Name) {
        const Parts = [];
        Array.from(ParticleContainer.children).forEach(Part => {
            if (!Part.hasAttribute("Name")) return;
            const PartName = String(Part.getAttribute("Name").replace(/['"]/g, ""));
            if (PartName == Name) Parts.push(Part);
        });
        return Parts;
    }

    static SetType(Type0, Type1) {
        Array.from(ParticleContainer.children).forEach(Part => {
            const TypeAttr = Part.getAttribute("Type");
            if (TypeAttr.includes(Type0)) {
                const Types = TypeAttr.split(",");
                const NewType = Types[0] === Type0 ? Type1 : Types[0];
                Part.setAttribute("Type", NewType);
            }
        });
    }

    static AreTheseColliding(Part0, Part1) {
        const Offset = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ];
    
        const Pos = {
            X: parseInt(Part0.style.left) + window.GridSize / 2,
            Y: parseInt(Part0.style.top) + window.GridSize / 2,
        };
    
        return Offset.some(Item => {
            const Neighbor = document.elementFromPoint(
                Math.floor((Pos.X + (Item[0] * window.GridSize))) / window.GridSize,
                Math.floor((Pos.Y + (Item[1] * window.GridSize))) / window.GridSize
            );
            if (Neighbor === Api.ParticleContainer) return false;
            if (!Neighbor) return false;
            if (Neighbor !== Part1) return false;
    
            return true;
        });
    }

    static BurnParticle(Particle) {
        if (!Particle.hasAttribute("Flammable")) return;
        Particle.setAttribute("Burning", true);

        const Loop = () => {
            if (!window.Playing) return;

            const FlammableData = JSON.parse(Particle.getAttribute("Flammable"));
            const Residue = FlammableData[1][Math.floor(Math.random() * FlammableData[1].length)];
            
            if (FlammableData[2] <= 0) {
                Api.Particle.GeneratePart(
                    { X: parseInt(Particle.style.left), Y: parseInt(Particle.style.top) - window.GridSize, Snapped: true },
                    Api.Particle.GetElement(Residue)
                );
                Particle.remove();
                return;
            } else {
                Particle.setAttribute("Flammable", JSON.stringify([true, FlammableData[1], FlammableData[2] - parseInt(Api.Numeric.Random(8, 32))]));
            }

            requestAnimationFrame(Loop);
        }

        Loop();
    }

    static GetPartFromPosition(X = 0, Y = 0) {
        X = Math.round(X / window.GridSize) * window.GridSize;
        Y = Math.round(Y / window.GridSize) * window.GridSize;

        Array.from(ParticleContainer.children).forEach(Particle => {
            const ParticleX = parseInt(Particle.style.left);
            const ParticleY = parseInt(Particle.style.top);
            
            if (ParticleX === X && ParticleY === Y) return Particle;
        });
    }

    static GetParticlesInRadius(CenterX, CenterY, Radius) {
        let ParticlesInGrid = [];
    
        Array.from(ParticleContainer.children).forEach(Particle => {
            const ParticleX = parseInt(getComputedStyle(Particle).left.replace("px", ""));
            const ParticleY = parseInt(getComputedStyle(Particle).top.replace("px", ""));

            const SnappedX = Math.round(ParticleX / GridSize) * GridSize;
            const SnappedY = Math.round(ParticleY / GridSize) * GridSize;

            let Distance = Math.sqrt((CenterX - SnappedX) ** 2 + (CenterY - SnappedY) ** 2);

            if (Distance <= Radius) {
                ParticlesInGrid.push(Particle);
            }
        });

        return ParticlesInGrid;
    }

    static GeneratePart(Pos = {
        X: 0,
        Y: 0,
        Snapped: false,
    }, Particle, Additional = [], IgnoreOccupation = false, Display = false, DisplayParent) {
        let Type;
        if (Particle.Type.includes(",")) {
            Type = Particle.Type.split(",")[1];
        }
        
        const X = Pos.Snapped ? Pos.X : Math.round(Pos.X / window.GridSize) * window.GridSize;
        const Y = Pos.Snapped ? Pos.Y : Math.round(Pos.Y / window.GridSize) * window.GridSize;

        if (Particle.Name === "NONE" || window.ElementSelection.Name === "NONE") {
            this.RemovePartFromPosition(X, Y);
            return;
        }

        if (Particle && !this.IsPlaceOccupied(X, Y) || IgnoreOccupation) {
            const ColorArray = Api.Numeric.RgbToArray(Particle.Color);
            const NewColor = window.Effects.Powder.Enabled
                ? `rgb(${Math.random() * (ColorArray[0] + window.Effects.Powder.Power - (ColorArray[0] - window.Effects.Powder.Power)) + (ColorArray[0] - window.Effects.Powder.Power)}, 
                       ${Math.random() * (ColorArray[1] + window.Effects.Powder.Power - (ColorArray[1] - window.Effects.Powder.Power)) + (ColorArray[1] - window.Effects.Powder.Power)}, 
                       ${Math.random() * (ColorArray[2] + window.Effects.Powder.Power - (ColorArray[2] - window.Effects.Powder.Power)) + (ColorArray[2] - window.Effects.Powder.Power)})`
                : Particle.Color;

            const ParticleElement = document.createElement("div");
            ParticleElement.style.width = `${window.GridSize}px`;
            ParticleElement.style.aspectRatio = "1 / 1";
            ParticleElement.style.left = `${X}px`;
            ParticleElement.style.top = `${Y}px`;
            ParticleElement.style.backgroundColor = NewColor;
            ParticleElement.classList.add("Particle");
            ParticleElement.style.setProperty("--color", Particle.Color);
            ParticleElement.setAttribute("Type", Particle.Type);
            ParticleElement.setAttribute("Temp", Particle.Temp || 22);

            PartStates.forEach(State => Particle[State] ? ParticleElement.setAttribute(State, Particle[State]) : "");

            Additional.forEach(Property => {
                ParticleElement.setAttribute(Property.Name, Property.Value);
            });

            Object.keys(Particle).forEach(Key => {
                ParticleElement.setAttribute(Key.replace(/['"]/g, ""), JSON.stringify(Particle[Key]));
                ParticleElement.setAttribute(`NC${Key.replace(/['"]/g, "")}`, JSON.stringify(Particle[Key]));
            });

            if (Particle.Melt >= 200) {
                ParticleElement.style.setProperty("--molten-color", `rgb(${ColorArray[0] + (Particle.Melt / 10)}, ${ColorArray[1]}, ${ColorArray[2]})`);
            } else {
                ParticleElement.style.setProperty("--molten-color", Particle.Color);
            }

            if (Display) {
                DisplayParent.appendChild(ParticleElement);
            } else {
                ParticleContainer.appendChild(ParticleElement);
            }
        
            ParticleElement.setAttribute("Type", Type);
            Particles.push(ParticleElement);
            return ParticleElement;
        }
    }

    static RemovePartFromPosition(X, Y) {
        const GridSize = window.GridSize;
    
        X = Math.round(X / GridSize) * GridSize;
        Y = Math.round(Y / GridSize) * GridSize;
    
        const ParticleToRemove = Particles.find(Particle => {
            const ParticleX = Math.round(parseInt(Particle.style.left, 10) / GridSize) * GridSize;
            const ParticleY = Math.round(parseInt(Particle.style.top, 10) / GridSize) * GridSize;
            return ParticleX === X && ParticleY === Y;
        });
    
        if (ParticleToRemove) {
            ParticleToRemove.remove();
            Particles.splice(Particles.indexOf(ParticleToRemove), 1);
        }
    }    

    static RemovePartFromType(Type) {
        const ParticlesToRemove = Particles.filter(Particle => Particle.classList.contains(Type));
        ParticlesToRemove.forEach(Particle => {
            Particle.remove();
            Particles.splice(Particles.indexOf(Particle), 1);
        });
    }

    static RemovePartFromName(Name) {
        const ParticlesToRemove = Particles.filter(Particle => Particle.classList.contains(Name));
        ParticlesToRemove.forEach(Particle => {
            Particle.remove();
            Particles.splice(Particles.indexOf(Particle), 1);
        });
    }

    static IsPlaceOccupied(X = 0, Y = 0) {
        const GridSize = window.GridSize;
    
        X = Math.round(X / GridSize) * GridSize;
        Y = Math.round(Y / GridSize) * GridSize;
    
        return Array.from(ParticleContainer.children).some(Particle => {
            const ParticleX = Math.round(parseInt(Particle.style.left, 10) / GridSize) * GridSize;
            const ParticleY = Math.round(parseInt(Particle.style.top, 10) / GridSize) * GridSize;
            return ParticleX === X && ParticleY === Y;
        });
    }    

    static CheckCollision(Particle0, Particle1) {
        var Rect0 = Particle0.getBoundingClientRect();
        var Rect1 = Particle1.getBoundingClientRect();

        return !(
            ((Rect0.top + Rect0.height) < (Rect1.top)) ||
            (Rect0.top > (Rect1.top + Rect1.height)) ||
            ((Rect0.left + Rect0.width) < Rect1.left) ||
            (Rect0.left > (Rect1.left + Rect1.width))
        );
    }    

    static IsColliding(Particle) {
        for (const OtherPart of Array.from(ParticleContainer.children)) {
            if (OtherPart !== Particle) {
                if (this.CheckCollision(Particle, OtherPart)) {
                    return [true, OtherPart];
                }
            }
        }
        return false;
    }
    
    static DrawLineParticle(Element, StartPositionX, StartPositionY, EndPositionX, EndPositionY, Thickness) {
        const GridSize = window.GridSize;
    
        const Distance = Math.sqrt(Math.pow(EndPositionX - StartPositionX, 2) + Math.pow(EndPositionY - StartPositionY, 2));
        const NumberOfElements = Math.max(1, Math.floor(Distance / GridSize));
        const DeltaX = (EndPositionX - StartPositionX) / NumberOfElements;
        const DeltaY = (EndPositionY - StartPositionY) / NumberOfElements;
    
        for (let Index = 0; Index <= NumberOfElements; Index++) {
            for (let OffsetX = -Thickness; OffsetX <= Thickness; OffsetX += GridSize) {
                for (let OffsetY = -Thickness; OffsetY <= Thickness; OffsetY += GridSize) {
                    let CurrentX = StartPositionX + DeltaX * Index + OffsetX;
                    let CurrentY = StartPositionY + DeltaY * Index + OffsetY;
    
                    CurrentX = Math.round(CurrentX / GridSize) * GridSize;
                    CurrentY = Math.round(CurrentY / GridSize) * GridSize;
    
                    if (Element.Name === "NONE" || window.ElementSelection.Name === "NONE") {
                        this.RemovePartFromPosition(CurrentX, CurrentY);
                    } else {
                        this.GeneratePart({ X: CurrentX, Y: CurrentY, Snapped: true }, Element);
                    }
                }
            }
        }
    }
    
    static DrawLinePlaceholder(StartPositionX, StartPositionY, EndPositionX, EndPositionY, Thickness) {
        const GridSize = window.GridSize;
    
        const Distance = Math.sqrt(Math.pow(EndPositionX - StartPositionX, 2) + Math.pow(EndPositionY - StartPositionY, 2));
        const NumberOfElements = Math.floor(Distance / GridSize);
        const DeltaX = (EndPositionX - StartPositionX) / NumberOfElements;
        const DeltaY = (EndPositionY - StartPositionY) / NumberOfElements;
    
        PlaceholderContainer.innerHTML = "";
    
        for (let Index = 0; Index < NumberOfElements; Index++) {
            for (let OffsetX = -Thickness; OffsetX <= Thickness; OffsetX += GridSize) {
                for (let OffsetY = -Thickness; OffsetY <= Thickness; OffsetY += GridSize) {
                    let CurrentX = StartPositionX + DeltaX * Index + OffsetX;
                    let CurrentY = StartPositionY + DeltaY * Index + OffsetY;
    
                    CurrentX = Math.round(CurrentX / GridSize) * GridSize;
                    CurrentY = Math.round(CurrentY / GridSize) * GridSize;
    
                    const PlaceholderItem = document.createElement("div");
                    PlaceholderItem.style.position = "absolute";
                    PlaceholderItem.style.backgroundColor = "rgb(60, 60, 60)";
                    PlaceholderItem.style.width = `${GridSize}px`;
                    PlaceholderItem.style.aspectRatio = "1 / 1";
                    PlaceholderItem.style.left = `${CurrentX}px`;
                    PlaceholderItem.style.top = `${CurrentY}px`;
                    PlaceholderItem.classList.add("LinePlaceholder");
                    PlaceholderContainer.appendChild(PlaceholderItem);
                }
            }
        }
    }    

    static ClearLinePlaceholder() {
        const LinePlaceholders = PlaceholderContainer.querySelectorAll(".LinePlaceholder");
        LinePlaceholders.forEach(Item => Item.remove());
    }

    static DrawCirclePlaceholder(X, Y, Radius) {
        const GridSize = window.GridSize;
        const StartX = X - Radius;
        const StartY = Y - Radius;
        const EndX = X + Radius;
        const EndY = Y + Radius;
    
        const GridStartX = Math.round(StartX / GridSize) * GridSize;
        const GridStartY = Math.round(StartY / GridSize) * GridSize;
        const GridEndX = Math.round(EndX / GridSize) * GridSize;
        const GridEndY = Math.round(EndY / GridSize) * GridSize;
    
        PlaceholderContainer.innerHTML = "";
    
        for (let CurrentX = GridStartX; CurrentX <= GridEndX; CurrentX += GridSize) {
            for (let CurrentY = GridStartY; CurrentY <= GridEndY; CurrentY += GridSize) {
                const Distance = Math.sqrt(Math.pow(CurrentX - X, 2) + Math.pow(CurrentY - Y, 2));
                if (Distance <= Radius) {
                    const PlaceholderItem = document.createElement("div");
                    PlaceholderItem.style.position = "absolute";
                    PlaceholderItem.style.backgroundColor = "rgb(60, 60, 60)";
                    PlaceholderItem.style.width = `${GridSize}px`;
                    PlaceholderItem.style.aspectRatio = "1 / 1";
                    PlaceholderItem.style.left = `${CurrentX}px`;
                    PlaceholderItem.style.top = `${CurrentY}px`;
                    PlaceholderItem.classList.add("CirclePlaceholder");
                    PlaceholderContainer.appendChild(PlaceholderItem);
                }
            }
        }
    }

    static ClearCirclePlaceholder() {
        const LinePlaceholders = PlaceholderContainer.querySelectorAll(".CirclePlaceholder");
        LinePlaceholders.forEach(Item => Item.remove());
    }

    static Plot = class {
        static EraseLastGraphExpression() {
            if (GraphJobs.length > 0) {
                const LastJob = GraphJobs.pop();
                LastJob.Undo();
                RedoStack.push(LastJob);
            }
        }
    
        static EraseSpecificExpression(Id) {
            const Expression = Array.from(DisplayParticleContainer.children).find(
                (Expr) => Expr.dataset.Id === Id
            );
            if (Expression) Expression.remove();
        }
    
        static DrawArithmeticParticleGraph(
            Expression, Pos = { X: 0, Y: 0, Snapped: false }, Particle, MaxParticles,
            xMin = -50, xMax = 50, yMin = -50, yMax = 50, Step = 1, Save = true
        ) {
            const Id = Characters[GraphJobs.length];
    
            const ExpressionGroup = document.createElement("div");
            ExpressionGroup.dataset.Id = Id;
            DisplayParticleContainer.appendChild(ExpressionGroup);
    
            if (Save) {
                GraphJobs.push({
                    Undo: () => this.EraseSpecificExpression(Id),
                    Redo: () => {
                        this.DrawArithmeticParticleGraph(
                            Expression, Pos, Particle, MaxParticles,
                            xMin, xMax, yMin, yMax, Step, false
                        );
                    },
                });

                RedoStack.length = 0;
            }
    
            const EvaluateExpression = (X, Y) => {
                try {
                    return eval(Expression.replace("x", X).replace("y", Y));
                } catch {
                    return 0;
                }
            };
    
            let ParticleCount = 0;
    
            const ThrottledDrawing = () => {
                let X = xMin;
    
                const Loop = () => {
                    const Result = EvaluateExpression(X, Pos.Y);
    
                    if (ParticleCount < MaxParticles) {
                        const ParticleElement = Api.Particle.GeneratePart(
                            {
                                X: Pos.X + X * window.GridSize,
                                Y: Pos.Y - Result * window.GridSize,
                                Snapped: true,
                            },
                            Particle,
                            [{ Name: "Graph", Value: "true" }],
                            true,
                            true,
                            ExpressionGroup
                        );
    
                        if (ParticleElement) {
                            ParticleCount++;
                        }
                    }
    
                    X += Step;
                    if (X <= xMax && ParticleCount < MaxParticles) {
                        requestAnimationFrame(Loop);
                    }
                };
    
                Loop();
            };
    
            ThrottledDrawing();
        }
    };    
}

export class Vector2 {
    constructor(Vector = [0, 0]) {
        this.Vector = Vector;
    }

    get Angle() {
        return Math.atan2(this.Vector[1], this.Vector[0]) * (180 / Math.PI);
    }

    get Magnitude() {
        return Math.sqrt(Math.pow(this.Vector[0], 2) + Math.pow(this.Vector[1], 2));
    }
}

export class Vector4 {
    constructor(Vector = [0, 0, 0, 0]) {
        this.Vector = Vector;
    }

    get Magnitude() {
        return Math.sqrt(
            Math.pow(this.Vector[2] - this.Vector[0], 2) +
            Math.pow(this.Vector[3] - this.Vector[1], 2)
        );
    }

    get Angle() {
        const X1 = this.Vector[0];
        const Y1 = this.Vector[1];
        const X2 = this.Vector[2];
        const Y2 = this.Vector[3];
        return Math.atan2(Y2 - Y1, X2 - X1);
    }
}

export class Siders {
    static Add(Element) {
        let ElementPropertyData = {};
        Object.keys(Element).forEach(Property => {
            ElementPropertyData[Property] = Element[Property];
        });

        const ElementDiv = document.createElement("div");
        ElementDiv.innerHTML = Element.Icon ? `<img src="${Element.Icon}">` : String(Element.Name).toUpperCase();
        ElementDiv.style.backgroundColor = Element.Color;
        const [R, G, B] = Api.Numeric.RgbToArray(Element.Color);
        (0.299 * R + 0.587 * G + 0.114 * B) / 255 < 0.25 ? ElementDiv.style.color = "rgb(255, 255, 255)" : ElementDiv.style.color = "rgb(0, 0, 0)";
        ElementDiv.setAttribute("Properties", JSON.stringify(ElementPropertyData));

        if (window.Selector.querySelector(`.${String(Element.Type.includes(",") && Element.Type.includes("Gas") ? Element.Type.split(",")[1] : Element.Type).trim()}`)) {
            window.Selector.querySelector(`.${String(Element.Type.includes(",") && Element.Type.includes("Gas") ? Element.Type.split(",")[1] : Element.Type).trim()}`).appendChild(ElementDiv)

            ElementDiv.addEventListener("click", () => {
                window.ElementSelection = Element;
            });
        }

        NewElements.push(Element);
    }

    static Remove(ElementName) {
        Array.from(window.Selector.querySelector(`.${NewElements.find(Element => Element.Name === Name).Type}`).children).forEach(ElementDiv => {
            if (ElementDiv.innerHTML === ElementName.trim().toUpperCase()) ElementDiv.remove();
        });

        const Index = NewElements.findIndex(item => item.Name === ElementName);
        if (Index !== -1) {
            NewElements.splice(Index, 1);
        }
    }
}

export class SimulationSettings {
    constructor(NewSimulationSettings = {
        Name: "",
        Icon: "",
        Events: {
            OnClick: () => {},
            OnStart: () => {},
            OnHover: () => {}
        }
    }) {
        this.SimulationSettings = NewSimulationSettings;
    }

    Append() {
        const SettingsElement = document.createElement("div");
        this.SimulationSettings.Events ? this.SimulationSettings.Events.OnStart ? this.SimulationSettings.Events.OnStart : "" : "";
        SettingsElement.addEventListener("click", this.SimulationSettings.Events ? this.SimulationSettings.Events.OnClick ? this.SimulationSettings.Events.OnClick : () => {} : () => {});
        SettingsElement.addEventListener("mouseover", this.SimulationSettings.Events ? this.SimulationSettings.Events.OnHover ? this.SimulationSettings.Events.OnHover : () => {} : () => {});
        SettingsElement.classList.add(this.SimulationSettings.Name);
        SimulationSettingsList.appendChild(SettingsElement);

        const HeaderElement = document.createElement("header");
        HeaderElement.innerHTML = this.SimulationSettings.Icon;
        SettingsElement.appendChild(HeaderElement);

        const DescriptionElement = document.createElement("span");
        DescriptionElement.innerHTML = this.SimulationSettings.Name;
        SettingsElement.appendChild(DescriptionElement);

        return SettingsElement;
    }

    AppendChild(Child) {
        document.querySelectorAll(`.${this.SimulationSettings.Name}`)[0].appendChild(Child);
    }

    Remove() {
        if (document.querySelectorAll(`.${this.SimulationSettings.Name}`)[0].classList.contains(this.SimulationSettings.Name)) Element.remove();
    }

    Update() {
        if (document.querySelectorAll(`.${this.SimulationSettings.Name}`)[0].classList.contains(this.SimulationSettings.Name)) document.querySelectorAll(`.${this.SimulationSettings.Name}`)[0].innerHTML = this.SimulationSettings.Icon;
    }
}

export class DevConsole {
    static Write(String = "") {
        const ConsoleElement = document.createElement("div");
        ConsoleElement.textContent = String;
        Console.querySelector(".Output").appendChild(ConsoleElement);
    }

    static Clear() {
        Console.querySelector(".Output").innerHTML = "";
    }
}

export class Numeric {
    static Random(Min, Max) {
        return Math.random() * (Max - Min) + Min;
    }

    static RgbToArray(Rgb = "") {
        const ColorArray = Rgb.replace("rgb", "").replace("(", "").replace(")", "").split(",");
        ColorArray.forEach(N => {
            N = parseInt(N);
        });
        return ColorArray;
    }

    static Factorial(Number = 1) {
        let Total = 1;
        for (let Index = 1; Index <= Number; Index++) {
            Total *= Index;
        }
        return Total;
    }
    
    static Matrix = class {
        static Add(Matrix0, Matrix1) {
            const Result = new Numeric.Matrix.Init(Matrix0.Rows, Matrix0.Cols);
            for (let i = 0; i < Matrix0.Rows; i++) {
                for (let j = 0; j < Matrix0.Cols; j++) {
                    Result.Set(i, j, Matrix0.Get(i, j) + Matrix1.Get(i, j));
                }
            }
            return Result;
        }

        static Subtract(Matrix0, Matrix1) {
            const Result = new Numeric.Matrix.Init(Matrix0.Rows, Matrix0.Cols);
            for (let i = 0; i < Matrix0.Rows; i++) {
                for (let j = 0; j < Matrix0.Cols; j++) {
                    Result.Set(i, j, Matrix0.Get(i, j) - Matrix1.Get(i, j));
                }
            }
            return Result;
        }

        static Multiply(Matrix0, Matrix1) {
            const Result = new Numeric.Matrix.Init(Matrix0.Rows, Matrix1.Cols);
            for (let i = 0; i < Matrix0.Rows; i++) {
                for (let j = 0; j < Matrix1.Cols; j++) {
                    let Sum = 0;
                    for (let k = 0; k < Matrix0.Cols; k++) {
                        Sum += Matrix0.Get(i, k) * Matrix1.Get(k, j);
                    }
                    Result.Set(i, j, Sum);
                }
            }
            return Result;
        }
        
        static Divide(Matrix0, Matrix1) {
            const Result = new Numeric.Matrix.Init(Matrix0.Rows, Matrix0.Cols);
            for (let i = 0; i < Matrix0.Rows; i++) {
                for (let j = 0; j < Matrix0.Cols; j++) {
                    Result.Set(i, j, Matrix0.Get(i, j) / Matrix1.Get(i, j));
                }
            }
            return Result;
        }

        static Init(Rows, Cols) {
            return {
                Rows,
                Cols,
                Get(Row, Col) {
                    return this.data[Row * this.Cols + Col];
                },
                Set(Row, Col, Value) {
                    this.data[Row * this.Cols + Col] = Value;
                }
            };
        }
    }

    static Vector = class {
        static Add(Vector0, Vector1) {
            const Result = new Array(Vector0.length);
            for (let i = 0; i < Vector0.length; i++) {
                Result[i] = Vector0[i] + Vector1[i];
            }
            return Result;
        }

        static Subtract(Vector0, Vector1) {
            const Result = new Array(Vector0.length);
            for (let i = 0; i < Vector0.length; i++) {
                Result[i] = Vector0[i] - Vector1[i];
            }
            return Result;
        }

        static Multiply(Vector0, Vector1) {
            const Result = 0;
            for (let i = 0; i < Vector0.length; i++) {
                Result += Vector0[i] * Vector1[i];
            }
            return Result;
        }

        static Divide(Vector0, Vector1) {
            const Result = new Array(Vector0.length);
            for (let i = 0; i < Vector0.length; i++) {
                Result[i] = Vector0[i] / Vector1[i];
            }
            return Result;
        }
    }
}

export class Storage {
    constructor(Storage = {
        StorageId: undefined || "",
        BackupId: undefined || "",
        StorageName: "",
        StorageSize: undefined || 0,
        State: 1,
        StorageItems: []
    }) {
        this.Storage = Storage;
    }

    Append() {
        if (localStorage.getItem(this.Storage.StorageId) || !this.Storage.StorageName) return;
        if (!this.Storage.StorageId) this.Storage.StorageId = `${Characters[Math.floor(Math.random() * Characters.length)].toUpperCase()}${(Math.random().toString(36).substring(2, 8))}`;
        if (!this.Storage.StorageSize) this.Storage.StorageSize = 255;
    
        localStorage.setItem(this.Storage.StorageId, JSON.stringify(this.Storage));
        localStorage.setItem(`Backup:${this.Storage.BackupId || this.Storage.StorageId || "Backup"}`, JSON.stringify(this.Storage));
    }    

    AddItem(Item) {
        if (!localStorage.getItem(this.Storage.StorageId)) return;
        
        const StorageObject = JSON.parse(localStorage.getItem(this.Storage.StorageId));
        
        let StorageItemsArray = Array.isArray(StorageObject.StorageItems) ? StorageObject.StorageItems : [];
    
        StorageItemsArray.push(Item);
        
        if (!this.Storage.StorageSize || StorageItemsArray.length <= this.Storage.StorageSize) {
            StorageObject.ItemStorage = StorageItemsArray;
            localStorage.setItem(this.Storage.StorageId, JSON.stringify(StorageObject));
        }
    }    

    RemoveItem(Item) {
        if (!localStorage.getItem(this.Storage.StorageId)) return;

        const StorageArray = JSON.parse(localStorage.getItem(this.Storage.StorageId));
        const UpdatedStorageArray = StorageArray.filter(StoredItem => JSON.stringify(StoredItem) !== JSON.stringify(Item));

        localStorage.setItem(this.Storage.StorageId, JSON.stringify(UpdatedStorageArray));
    }

    UpdateItem(OldItem, NewItem) {
        if (!localStorage.getItem(this.Storage.StorageId)) return;
    
        const StorageObject = JSON.parse(localStorage.getItem(this.Storage.StorageId));
        const ItemsArray = StorageObject.StorageItems;
        const UpdatedItemsArray = ItemsArray.map(StoredItem =>
            JSON.stringify(StoredItem) === JSON.stringify(OldItem) ? NewItem : StoredItem
        );
    
        StorageObject.StorageItems = UpdatedItemsArray;
        localStorage.setItem(this.Storage.StorageId, JSON.stringify(StorageObject));
    }    

    HasItem(Query, Search) {
        const StoredItems = this.GetItems();
        return StoredItems.some(StoredItem => Query in StoredItem && StoredItem[Query] === Search);
    }

    GetItems() {
        const StoredItems = localStorage.getItem(this.Storage.StorageId);
        return StoredItems ? Array.from(JSON.parse(StoredItems)) : [];
    }

    CheckStorage(Override = {
        CheckFromStorageId: false,
        CheckFromStorageName: false,
        CheckFromStorageSize: false,
        CheckFromState: false,
        CheckFromBackupId: false,
        OverrideQuerySearch: ""
    }) {
        if (Override) {
            const CheckOverrideName = Object.keys(Override).some(OverrideKey => {
                const OverrideName = OverrideKey.replace("CheckFrom", "");
                if (Override[OverrideKey] && this.Storage[OverrideName] !== Override[OverrideKey]) {
                    return false;
                }
                return true;
            });
    
            if (CheckOverrideName) return [true, this.Storage];
        }
    
        const Storage = localStorage.getItem(this.Storage.StorageId);
        return Storage ? [true, Storage] : [false];
    }    

    Terminate() {
        localStorage.removeItem(this.Storage.StorageId);
    }

    Restore() {
        const Backup = localStorage.getItem(`Backup:${this.Storage.BackupId || this.Storage.StorageId}`);
        return Backup ? JSON.parse(Backup) : null;
    }

    static Session = class {
        constructor(SessionData = {
            SessionId: undefined || "",
            SessionName: "",
            SessionReceipt: [],
            SessionTimeout: 0
        }) {
            this.SessionData = SessionData;
        }

        SessionEvents = {
            Start: "0001",
            End: "0010",
            Change: "0011",
            Clear: "0100",
            Save: "0101",
            Load: "0110",
            Push: "1000"
        };

        Start() {
            if (!this.SessionData.SessionName) return;
            if (!this.SessionData.SessionId) {
                this.SessionData.SessionId = `${Characters[Math.floor(Math.random() * Characters.length)].toUpperCase()}${(Math.random().toString(36).substring(2, 8))}`;
            }

            const CurrentTime = Math.floor(Date.now() / 1000);
            if (this.SessionData.SessionTimeout && this.SessionData.SessionTimeout >= CurrentTime) return;

            this.SessionData.SessionTimeout = CurrentTime + 3600;
            this.SessionData.SessionReceipt.push({ Timestamp: CurrentTime, Event: this.SessionEvents.Start });
            localStorage.setItem(this.SessionData.SessionId, "[]");
        }

        End() {
            if (!localStorage.getItem(this.SessionData.SessionId)) return;

            const CurrentTime = Math.floor(Date.now() / 1000);
            localStorage.removeItem(this.SessionData.SessionId);
            this.SessionData.SessionReceipt.push({ Timestamp: CurrentTime, Event: this.SessionEvents.End });
        }

        Change(NewSessionData) {
            if (!localStorage.getItem(this.SessionData.SessionId)) return;

            const CurrentTime = Math.floor(Date.now() / 1000);
            localStorage.setItem(this.SessionData.SessionId, JSON.stringify(NewSessionData));
            this.SessionData.SessionReceipt.push({ Timestamp: CurrentTime, Event: this.SessionEvents.Change });
        }

        Get() {
            if (!localStorage.getItem(this.SessionData.SessionId)) return;
            const CurrentTime = Math.floor(Date.now() / 1000);
            this.SessionData.SessionReceipt.push({ Timestamp: CurrentTime, Event: this.SessionEvents.Load });
            return JSON.parse(localStorage.getItem(this.SessionData.SessionId));
        }

        Push(Data) {
            if (!localStorage.getItem(this.SessionData.SessionId)) return;

            const CurrentTime = Math.floor(Date.now() / 1000);
            const SessionData = this.Get() || [];
            SessionData.push(Data);
            localStorage.setItem(this.SessionData.SessionId, JSON.stringify(SessionData));
            this.SessionData.SessionReceipt.push({ Timestamp: CurrentTime, Event: this.SessionEvents.Push });
        }

        Clear() {
            if (!localStorage.getItem(this.SessionData.SessionId)) return;

            const CurrentTime = Math.floor(Date.now() / 1000);
            localStorage.setItem(this.SessionData.SessionId, "[]");
            this.SessionData.SessionReceipt.push({ Timestamp: CurrentTime, Event: this.SessionEvents.Clear });
        }
    };
}

export class Notification {
    constructor(Notification = {
        Title: "",
        Content: "",
        Timestamp: 0,
        Options: {
            AutoClose: {
                Enabled: false,
                Timer: 250
            },
            CloseIcon: "X",
        },
        Style: {
            Border: {
                Color: "rgba(255, 255, 255, 0.125)",
                Radius: "8px"
            },
            TextColor: "rgb(255, 255, 255)",
            BackgroundColor: "rgba(255, 255, 255, 0.175)",
            Alignment: {
                JustifyContent: "flex-start",
                AlignContent: "flex-start",
                AlignItems: "flex-start"
            },
            Size: {
                Height: "4em",
                Width: "100%"
            }
        },
        Events: {
            OnStart: () => {},
            OnClose: () => {},
            OnHover: () => {}
        }
    }) {
        this.Notification = Notification;
        this.NotificationElement = undefined;
    }

    Append(Parent = null) {
        if (!Parent) Parent = document.querySelector(".Notifications");
        if (!Parent || !(Parent instanceof HTMLElement)) throw new Error("Parent must be a valid DOM element.");
        if (this.Notification.Events?.OnStart) this.Notification.Events.OnStart();
    
        const NotificationElement = document.createElement("div");
        NotificationElement.addEventListener("mouseenter", this.Notification.Events?.OnHover || (() => {}));
        Parent.appendChild(NotificationElement);

        () => {
            NotificationElement.style.width = this.Notification.Style?.Size?.Width;
            NotificationElement.style.height = this.Notification.Style?.Size?.Height;

            NotificationElement.style.justifyContent = this.Notification.Style?.Alignment?.JustifyContent;
            NotificationElement.style.alignContent = this.Notification.Style?.Alignment?.AlignContent;
            NotificationElement.style.alignItems = this.Notification.Style?.Alignment?.AlignItems;

            NotificationElement.style.borderColor = this.Notification.Style?.Border?.Color;
            NotificationElement.style.borderRadius = this.Notification.Style?.Border?.Radius;

            NotificationElement.style.backgroundColor = this.Notification.Style?.BackgroundColor;
            NotificationElement.style.color = this.Notification.Style?.TextColor;
        };
    
        const NotificationHeader = document.createElement("header");
        NotificationHeader.innerHTML = this.Notification.Title;
        NotificationElement.appendChild(NotificationHeader);
    
        const NotificationContent = document.createElement("span");
        NotificationContent.innerHTML = this.Notification.Content;
        NotificationElement.appendChild(NotificationContent);

        const NotificationCloseButton = document.createElement("button");
        NotificationCloseButton.innerHTML = this.Notification?.Options?.CloseIcon ? this.Notification.Options.CloseIcon : "X";
        NotificationCloseButton.addEventListener("click", () => {
            if (this.Notification.Events?.OnClose) this.Notification.Events.OnClose();
            NotificationElement.remove();
        });
        NotificationElement.appendChild(NotificationCloseButton);
    
        if (this.Notification.Timestamp) {
            const DateTime = new Date(this.Notification.Timestamp * 1000);
            const Hours = DateTime.getHours().toString().padStart(2, "0");
            const Minutes = DateTime.getMinutes().toString().padStart(2, "0");
            const NotificationTime = document.createElement("time");
            NotificationTime.innerHTML = `${Hours}:${Minutes}`;
            NotificationElement.appendChild(NotificationTime);
        }

        if (this.Notification.Options.AutoClose.Enabled) setTimeout(() => NotificationElement.remove(), this.Notification.Options.AutoClose.Timer);
    
        this.NotificationElement = NotificationElement;
        return NotificationElement;
    }

    Change(Title = "", Content = "", Timestamp = 0) {
        if (!this.NotificationElement) return;
        if (Title) {
            this.NotificationElement.querySelector("header").innerHTML = Title;
        }
        if (Content) {
            this.NotificationElement.querySelector("span").innerHTML = Content;
        }

        if (Timestamp) {
            const DateTime = new Date(Timestamp * 1000);
            const Hours = DateTime.getHours().toString().padStart(2, "0");
            const Minutes = DateTime.getMinutes().toString().padStart(2, "0");
            this.Notification.Timestamp = Timestamp;
            const TimeElement = this.NotificationElement.querySelector("time");
            if (TimeElement) {
                TimeElement.innerHTML = `${Hours}:${Minutes}`;
            }
        }
    }

    Destroy() {
        if (!this.NotificationElement) return;
        this.NotificationElement.remove();
        this.NotificationElement = undefined;
    }
}

export class ClickAndHold {
    /**
     * @param {EventTarget} Target The HTML element target to apply the ClickAndHold event to
     * @param {Function} Callback The callback runs once the target is clicked and held
     * @param {Numeric} Timeout The timeout that applies to the click and hold timeout, optional.
    */
    constructor(TargetElement, CallbackFunction, TimeoutDuration) {
        this.Target = TargetElement;
        this.Callback = CallbackFunction;
        this.IsHeld = false;
        this.Timeout = TimeoutDuration ? TimeoutDuration : 500;
        this.ActiveHoldTimeout = null;

        this.OnHoldStartBound = this.OnHoldStart.bind(this);
        this.OnHoldEndBound = this.OnHoldEnd.bind(this);

        ["mousedown", "touchstart"].forEach(EventType => {
            this.Target.addEventListener(EventType, this.OnHoldStartBound, { passive: false });
        });

        ["mouseup", "mouseleave", "mouseout", "touchend", "touchcancel"].forEach(EventType => {
            this.Target.addEventListener(EventType, this.OnHoldEndBound, { passive: false });
        });
    }

    OnHoldStart(Event) {
        if (Event.button === 2) {
            return;
        }

        this.IsHeld = true;

        this.ActiveHoldTimeout = setTimeout(() => {
            if (this.IsHeld) {
                this.Callback(Event);
                this.IsHeld = false;
            }
        }, this.Timeout);
    }

    OnHoldEnd() {
        this.IsHeld = false;
        clearTimeout(this.ActiveHoldTimeout);
    }

    static Assign(TargetElement, CallbackFunction) {
        return new ClickAndHold(TargetElement, CallbackFunction);
    }
}

export function IsUserInteracting() {
    return document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA";
}

export function CopyToClipboard(Text) {
    navigator.clipboard.writeText(Text);
}

export function SaveAs(Blob, Name) {
    const Url = URL.createObjectURL(Blob);
    const Link = document.createElement("a");
    Link.href = Url;
    Link.download = Name;
    Link.click();
    URL.revokeObjectURL(Url);
}

export function DownloadAsJson(Data, Name) {
    const Blob = new Blob([JSON.stringify(Data)], { type: "application/json" });
    SaveAs(Blob, Name);
}

export function AlignToGrid(Number) {
    return Math.round(Number / window.GridSize) * window.GridSize;
}

export function Mulberry32(Seed) {
    return function () {
        Seed |= 0;
        Seed = Seed + 0x6D2B79F5 | 0;
        let T = Math.imul(Seed ^ Seed >>> 15, 1 | Seed);
        T = T ^ T + Math.imul(T ^ T >>> 7, 61 | T);
        return ((T ^ T >>> 14) >>> 0) / 4294967296;
    };
}

export function CreatePerlin(Seed) {
    const Gradients = [];
    const Permutations = [];
    const Random = Mulberry32(Seed);

    for (let I = 0; I < 256; I++) {
        let X = Random() * 2 - 1;
        let Y = Random() * 2 - 1;
        let Length = Math.hypot(X, Y);
        Gradients.push([X / Length, Y / Length]);
        Permutations.push(I);
    }

    for (let I = 255; I > 0; I--) {
        const J = Math.floor(Random() * (I + 1));
        [Permutations[I], Permutations[J]] = [Permutations[J], Permutations[I]];
    }

    const P = Permutations.concat(Permutations);

    function Dot(GridX, GridY, X, Y) {
        const Gradient = Gradients[P[GridX + P[GridY]] % 256];
        return Gradient[0] * X + Gradient[1] * Y;
    }

    function Fade(T) {
        return T * T * T * (T * (T * 6 - 15) + 10);
    }

    return function (X, Y) {
        const X0 = Math.floor(X);
        const Y0 = Math.floor(Y);
        const X1 = X0 + 1;
        const Y1 = Y0 + 1;

        const SX = X - X0;
        const SY = Y - Y0;

        const N0 = Dot(X0 & 255, Y0 & 255, SX, SY);
        const N1 = Dot(X1 & 255, Y0 & 255, SX - 1, SY);
        const N2 = Dot(X0 & 255, Y1 & 255, SX, SY - 1);
        const N3 = Dot(X1 & 255, Y1 & 255, SX - 1, SY - 1);

        const U = Fade(SX);
        const V = Fade(SY);

        const NX0 = N0 + U * (N1 - N0);
        const NX1 = N2 + U * (N3 - N2);

        return NX0 + V * (NX1 - NX0);
    };
}

export function GenerateNoise(Seed, Position = {X: 0.5, Y: 0.5}, Size = {Width: 1, Height: 1, Scale: 10, Smoothness: 0.5, Steps: 5}) {
    const Perlin = CreatePerlin(Seed);
    const Output = [];

    Position = {
        X: Position.X * window.innerWidth,
        Y: Position.Y * window.innerHeight
    };

    Size = {
        Width: Size.Width * window.innerWidth,
        Height: Size.Height * window.innerHeight,
        Scale: Size.Scale,
        Smoothness: Size.Smoothness,
        Steps: Size.Steps
    };

    const HalfWidth = Size.Width / 2;
    const lerp = (a, b, t) => a + (b - a) * t;

    for (let X = 0; X < Size.Width; X++) {
        const WorldX = Position.X - HalfWidth + X;
        let SmoothNoiseY = Perlin(WorldX / Size.Scale, Position.Y / Size.Scale);

        for (let Step = 1; Step < Size.Steps; Step++) {
            const NoiseY = Perlin((WorldX + Step) / Size.Scale, Position.Y / Size.Scale);
            SmoothNoiseY = lerp(SmoothNoiseY, NoiseY, Size.Smoothness);
        }

        const WorldY = Position.Y + SmoothNoiseY * Size.Height;
        Output.push([WorldX, WorldY]);
    }

    return Output;
}