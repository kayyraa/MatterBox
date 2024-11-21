import { Elements } from "./elements.js";

window.GridSize = 16;
window.Effects = {
    Powder: {
        Enabled: false,
        Power: 10
    }
};
window.Performance = {
    ReduceLight: false
}

export const PlaceholderContainer = document.querySelector(".PlaceholderContainer");
export const ParticleContainer = document.querySelector(".ParticleContainer");
export const Particles = [];

export const CursorXPosLabel = document.querySelector(".CursorXPosLabel");
export const CursorYPosLabel = document.querySelector(".CursorYPosLabel");
export const CursorRadiusLabel = document.querySelector(".CursorRadiusLabel");
export const CursorLineLabel = document.querySelector(".CursorLineLabel");
export const SelectionLabel = document.querySelector(".ElementSelectionLabel");

export const CursorElement = document.querySelector(".Cursor");

export class Particle {
    static GetElement(Name) {
        return Elements.find(Element => Element.Name === Name);
    }

    static GeneratePart(Pos = {
        X: 0,
        Y: 0,
        Snapped: false,
    }, Particle) {
        const X = Pos.Snapped ? Pos.X : Math.round(Pos.X / window.GridSize) * window.GridSize;
        const Y = Pos.Snapped ? Pos.Y : Math.round(Pos.Y / window.GridSize) * window.GridSize;

        if (!this.IsPlaceOccupied(X, Y)) {
            let Type = Particle.Type;
            if (Type.includes(",")) {
                Type = JSON.stringify(Particle.Type.split(","));
            }

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

            Object.keys(Particle).forEach(Key => {
                ParticleElement.dataset[Key.replaceAll('"', '').replaceAll("'", "")] = JSON.stringify(Particle[Key]);
            });

            ParticleContainer.appendChild(ParticleElement);
            Particles.push(ParticleElement);
            return ParticleElement;
        }
    }

    static RemovePartFromPosition(X, Y) {
        X = Math.round(X / window.GridSize) * window.GridSize;
        Y = Math.round(Y / window.GridSize) * window.GridSize;

        const ParticleToRemove = Particles.find(Particle => {
            const ParticleX = parseInt(Particle.style.left);
            const ParticleY = parseInt(Particle.style.top);
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
        X = Math.round(X / window.GridSize) * window.GridSize;
        Y = Math.round(Y / window.GridSize) * window.GridSize;

        return Array.from(ParticleContainer.children).some(Particle => {
            const ParticleX = Math.round(parseInt(Particle.style.left) / window.GridSize) * window.GridSize;
            const ParticleY = Math.round(parseInt(Particle.style.top ) / window.GridSize) * window.GridSize;
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
    
    static DrawLineParticle(Element, StartPositionX, StartPositionY, EndPositionX, EndPositionY) {
        const GridSize = window.GridSize;
    
        const Distance = Math.sqrt(Math.pow(EndPositionX - StartPositionX, 2) + Math.pow(EndPositionY - StartPositionY, 2));
        const NumberOfElements = Math.max(1, Math.floor(Distance / GridSize));
        const DeltaX = (EndPositionX - StartPositionX) / NumberOfElements;
        const DeltaY = (EndPositionY - StartPositionY) / NumberOfElements;
    
        for (let Index = 0; Index <= NumberOfElements; Index++) {
            let CurrentX = StartPositionX + DeltaX * Index;
            let CurrentY = StartPositionY + DeltaY * Index;
    
            CurrentX = Math.round(CurrentX / GridSize) * GridSize;
            CurrentY = Math.round(CurrentY / GridSize) * GridSize;
    
            this.GeneratePart({ X: CurrentX, Y: CurrentY, Snapped: true }, Element);
        }
    }
    
    static DrawLinePlaceholder(StartPositionX, StartPositionY, EndPositionX, EndPositionY) {
        const GridSize = window.GridSize;
    
        const Distance = Math.sqrt(Math.pow(EndPositionX - StartPositionX, 2) + Math.pow(EndPositionY - StartPositionY, 2));
        const NumberOfElements = Math.floor(Distance / GridSize);
        const DeltaX = (EndPositionX - StartPositionX) / NumberOfElements;
        const DeltaY = (EndPositionY - StartPositionY) / NumberOfElements;
    
        PlaceholderContainer.innerHTML = "";
    
        for (let Index = 0; Index < NumberOfElements; Index++) {
            let CurrentX = StartPositionX + DeltaX * Index;
            let CurrentY = StartPositionY + DeltaY * Index;
    
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