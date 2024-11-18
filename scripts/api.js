import { Elements } from "./elements.js";

window.GridSize = 16;
window.Gravity = 9.81;
window.Pressure = 0;
window.AmbientTamp = 0;
window.Effects = {
    Powder: {
        Enabled: true,
        Power: 20
    }
};
window.Ambient = {
    Quality: 128,
    Temp: 22,
    Enabled: false
}

export const ParticleContainer = document.querySelector(".ParticleContainer");
export const Particles = [];

export function Random(Min, Max) {
    return Math.random() * (Max - Min) + Min;
}

export class Particle {
    static GetElement(Name) {
        return Elements.find(Element => Element.Name === Name);
    }

    static GeneratePart(X, Y, Particle) {
        X = Math.round(X / window.GridSize) * window.GridSize;
        Y = Math.round(Y / window.GridSize) * window.GridSize;

        if (!this.IsPlaceOccupied(X, Y)) {
            let Type = Particle.Type;
            if (Type.includes(",")) {
                Type = JSON.stringify(Particle.Type.split(","));
            }

            const ColorArray = Particle.Color.match(/\d+/g).map(Number);
            const NewColor = window.Effects.Powder.Enabled
                ? `rgb(${Random(ColorArray[0] - window.Effects.Powder.Power, ColorArray[0] + window.Effects.Powder.Power)}, ${Random(ColorArray[1] - window.Effects.Powder.Power, ColorArray[1] + window.Effects.Powder.Power)}, ${Random(ColorArray[2] - window.Effects.Powder.Power, ColorArray[2] + window.Effects.Powder.Power)})`
                : Particle.Color;

            const ParticleElement = document.createElement("div");
            ParticleElement.style.width = `${window.GridSize}px`;
            ParticleElement.style.aspectRatio = "1 / 1";
            ParticleElement.style.left = `${X}px`;
            ParticleElement.style.top = `${Y}px`;
            ParticleElement.style.backgroundColor = NewColor;

            Object.keys(Particle).forEach(Key => {
                ParticleElement.dataset[Key] = JSON.stringify(Particle[Key]);
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

        return Particles.some(Particle => {
            const ParticleX = parseInt(Particle.style.left);
            const ParticleY = parseInt(Particle.style.top);
            return ParticleX === X && ParticleY === Y;
        });
    }

    static IsColliding(Particle0, Particle1) {
        const Rect0 = Particle0.getBoundingClientRect();
        const Rect1 = Particle1.getBoundingClientRect();
    
        return !(
            Rect0.right < Rect1.left ||
            Rect0.left > Rect1.right ||
            Rect0.bottom < Rect1.top ||
            Rect0.top > Rect1.bottom
        );
    }
}

export class Numeric {
    static Matrix = class {
        static Add(Matrix0, Matrix1) {
            const Result = new Matrix.Init(Matrix0.Rows, Matrix0.Cols);
            for (let i = 0; i < Matrix0.Rows; i++) {
                for (let j = 0; j < Matrix0.Cols; j++) {
                    Result.Set(i, j, Matrix0.Get(i, j) + Matrix1.Get(i, j));
                }
            }
            return Result;
        }

        static Subtract(Matrix0, Matrix1) {
            const Result = new Matrix.Init(Matrix0.Rows, Matrix0.Cols);
            for (let i = 0; i < Matrix0.Rows; i++) {
                for (let j = 0; j < Matrix0.Cols; j++) {
                    Result.Set(i, j, Matrix0.Get(i, j) - Matrix1.Get(i, j));
                }
            }
            return Result;
        }

        static Multiply(Matrix0, Matrix1) {
            const Result = new Matrix.Init(Matrix0.Rows, Matrix1.Cols);
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
            const Result = new Matrix.Init(Matrix0.Rows, Matrix0.Cols);
            for (let i = 0; i < Matrix0.Rows; i++) {
                for (let j = 0; j < Matrix0.Cols; j++) {
                    Result.Set(i, j, Matrix0.Get(i, j) / Matrix1.Get(i, j));
                }
            }
            return Result;
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