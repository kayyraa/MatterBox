import { Elements, PartStates } from "./elements.js";
import * as Api from "./api.js";

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

!localStorage.getItem("Mods") ? localStorage.setItem("Mods", "[]") : "";

const SupabaseUrl = "https://ddsgdfouzkefwlhrtkej.supabase.co";
const SupabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkc2dkZm91emtlZndsaHJ0a2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0MDcwMzcsImV4cCI6MjA0ODk4MzAzN30.6WneV_JFV72tXpl721kfMcQxmJTRvh5y9SOjGJ77kxM";
export const Supabase = supabase.createClient(SupabaseUrl, SupabaseKey);

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
export const AddNewModButton = document.querySelector(".AddNewButton");

export const Particles = [];
export const GraphJobs = [];
export const RedoStack = [];

export const Characters = "abcdefghijklmnopqrstuvwxyz"

export const CursorXPosLabel = document.querySelector(".CursorXPosLabel");
export const CursorYPosLabel = document.querySelector(".CursorYPosLabel");
export const CursorRadiusLabel = document.querySelector(".CursorRadiusLabel");
export const CursorLineLabel = document.querySelector(".CursorLineLabel");
export const SelectionLabel = document.querySelector(".ElementSelectionLabel");

export const SimulationSettingsList = document.querySelector(".SimulationSettingsList");

export const CursorElement = document.querySelector(".Cursor");
export const PartStats = document.querySelector(".PartStats");

export const Band = document.querySelector(".Band");

let NewElements = Elements;
export class Particle {
    static GetElement(Name) {
        return NewElements.find(Element => Element.Name === Name);
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

        if (Particle.Name === "NONE") {
            this.RemovePartFromPosition(X, Y);
            return;
        }

        if (Particle && !this.IsPlaceOccupied(X, Y) || IgnoreOccupation) {
            const ColorArray = Particle.Color.match(/\d+/g).map(Number);
            const NewColor = window.Effects.Powder.Enabled
                ? `rgb(${Numeric.Random(ColorArray[0] - window.Effects.Powder.Power, ColorArray[0] + window.Effects.Powder.Power)}, ${Numeric.Random(ColorArray[1] - window.Effects.Powder.Power, ColorArray[1] + window.Effects.Powder.Power)}, ${Numeric.Random(ColorArray[2] - window.Effects.Powder.Power, ColorArray[2] + window.Effects.Powder.Power)})`
                : Particle.Color;

            const ParticleElement = document.createElement("div");
            ParticleElement.style.width = `${window.GridSize}px`;
            ParticleElement.style.aspectRatio = "1 / 1";
            ParticleElement.style.left = `${X}px`;
            ParticleElement.style.top = `${Y}px`;
            ParticleElement.style.backgroundColor = NewColor;
            ParticleElement.classList.add("Particle");
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

            const RgbValues = Particle.Color.match(/\d+/g).map(Number);
            const Result = `rgb(${RgbValues[0] + Particle.Melt}, ${RgbValues[1] + (Particle.Melt / 8)}, ${RgbValues[2] - (Particle.Melt / 64)})`;
            if (Particle.Melt >= 200) {
                ParticleElement.style.setProperty("--molten-color", Result);
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
    
                    this.GeneratePart({ X: CurrentX, Y: CurrentY, Snapped: true }, Element);
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

export class Siders {
    static Add(Element) {
        let ElementPropertyData = {};
        Object.keys(Element).forEach(Property => {
            ElementPropertyData[Property] = Element[Property];
        });

        const ElementDiv = document.createElement("div");
        ElementDiv.innerHTML = Element.Icon ? `<img src="${Element.Icon}">` : String(Element.Name).toUpperCase();
        ElementDiv.style.backgroundColor = Element.Color;
        const [R, G, B] = Element.Color.match(/\d+/g).map(Number);
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

export class ClickAndHold {
    /**
     * @param {EventTarget} Target The HTML element target to apply the ClickAndHold event to
     * @param {Function} Callback The callback runs once the target is clicked and held
     * @param {Number} Timeout The timeout that applies to the click and hold timeout, optional.
     */
    constructor(Target, Callback, Timeout) {
        this.Target = Target;
        this.Callback = Callback;
        this.IsHeld = false;
        this.Timeout = Timeout ? Timeout : 500;
        this.ActiveHoldTimeout = null;

        ["mousedown", "touchstart"].forEach(Type => {
            this.Target.addEventListener(Type, this.OnHoldStart.bind(this), { passive: false });
        });

        ["mouseup", "mouseleave", "mouseout", "touchend", "touchcancel"].forEach(Type => {
            this.Target.addEventListener(Type, this.OnHoldEnd.bind(this), { passive: false });
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

    static Assign(Target, Callback) {
        return new ClickAndHold(Target, Callback);
    }
}

export function IsUserInteracting() {
    return document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA";
}