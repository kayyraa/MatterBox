import * as Api from "./api.js";
import * as Ambient from "./ambient.js";

const Directions = [
    [ 1,  0],
    [ 0,  1],
    [ 1,  1],
    [-1,  0],
    [ 0, -1],
    [-1, -1],
    [ 1, -1],
    [-1,  1]
];

const Radiated = ["NEUT", "PROT"];

function Loop() {
    if (Api.ParticleContainer.children.length > 0) {
        Array.from(Api.ParticleContainer.children).forEach(Particle => {
            let Velocity = parseInt(Particle.dataset.Velocity) || 0;
            let NewVelocity = Velocity;

            if (!Particle.dataset.LightDirection && Particle.dataset.Type.includes("Light")) {
                if (Radiated.includes(String(Particle.dataset.Name).replaceAll('"', ""))) {
                    const Angle = Math.random() * 2 * Math.PI;
                    Particle.dataset.LightDirection = JSON.stringify([Math.cos(Angle), Math.sin(Angle)]);
                } else {
                    Particle.dataset.LightDirection = JSON.stringify(Directions[Math.floor(Math.random() * Directions.length)]);
                }
            }

            const Pos = {
                X: Particle.offsetLeft,
                Y: Particle.offsetTop
            };

            if (Particle.dataset.Type === "Solid") {
                return;
            }

            if (parseFloat(Particle.dataset.Temp) > parseFloat(Particle.dataset.Melt)) {
                setTimeout(() => {
                    Particle.dataset.IsMolten = "true";
                    Particle.dataset.Type = Particle.dataset.Molten; 
                }, Api.Numeric.Random(125, 250));
            } else if (parseFloat(Particle.dataset.Temp) < parseFloat(Particle.dataset.Melt)) {
                setTimeout(() => {
                    Particle.dataset.IsMolten = "false";
                    Particle.dataset.Type = Particle.dataset.Cold; 
                }, Api.Numeric.Random(125, 250));
            }

            Api.Particles.forEach(OtherParticle => {
                if (OtherParticle !== Particle) {
                    if (Api.Particle.CheckCollision(Particle, OtherParticle)) {
                        const AverageTemp = (parseFloat(Particle.dataset.Temp) + parseFloat(OtherParticle.dataset.Temp)) / 2;
                        Particle.dataset.Temp = AverageTemp;
                        OtherParticle.dataset.Temp = AverageTemp;
                    }
                }
            });

            if (window.Ambient.Enabled) {
                const GridBlock = Ambient.GetClosestGridBlock(Particle.offsetLeft, Particle.offsetTop);
                if (GridBlock) {
                    const CurrentTemp = parseInt(GridBlock.dataset.Temp);
                    const CurrentPres = parseInt(GridBlock.dataset.Pres);
                    const ParticleTemp = parseInt(Particle.dataset.Temp);
                    const ParticlePres = parseFloat(Particle.dataset.Pres);
                
                    GridBlock.dataset.Temp = (CurrentTemp + ParticleTemp) / 2;
                    GridBlock.dataset.Pres = (CurrentPres + ParticlePres) / 2;
                    Particle.dataset.Pres -= Math.min(0, ParticlePres - 0.25);
                    Particle.dataset.Temp -= Math.min(22, ParticleTemp - 0.125);
                }
            }

            if (Particle.dataset.Type.includes("Powder")) {
                const Density = Particle.dataset.Physics ? JSON.parse(Particle.dataset.Physics).Density : 0;
                const Elasticity = Particle.dataset.Physics ? JSON.parse(Particle.dataset.Physics).Elasticity : 0;

                NewVelocity = (Velocity + Density) + (window.Gravity || 0);
                const NewPosY = Pos.Y + NewVelocity;

                if ((NewPosY + Particle.offsetHeight) <= Api.ParticleContainer.clientHeight && !Api.Particle.IsPlaceOccupied(Pos.X, NewPosY)) {
                    Particle.style.top = `${Math.round(NewPosY / window.GridSize) * window.GridSize}px`;
                    Particle.dataset.Velocity = NewVelocity;
                } else if (Elasticity) {
                    const BounceFactor = Api.Numeric.Random(Elasticity - 0.2, Elasticity + 0.2) || 0.8;
                    NewVelocity = -NewVelocity * BounceFactor;
                    const NewPosYAfterBounce = Pos.Y + NewVelocity;
                    Particle.style.top = `${Math.round(NewPosYAfterBounce / window.GridSize) * window.GridSize}px`;
                    Particle.dataset.Velocity = NewVelocity;
                } else {
                    Particle.dataset.Velocity = 0;
                }
            } else if (Particle.dataset.Type.includes("Liquid")) {
                NewVelocity = Velocity + (window.Gravity || 0);
                const NewPosY = Pos.Y + NewVelocity;
            
                if (NewPosY + Particle.offsetHeight <= Api.ParticleContainer.clientHeight && !Api.Particle.IsPlaceOccupied(Pos.X, NewPosY)) {
                    Particle.style.top = `${Math.round(NewPosY / window.GridSize) * window.GridSize}px`;
                    Particle.dataset.Velocity = NewVelocity;
                } else {
                    Particle.dataset.Velocity = 0;
            
                    const LeftPosX = Pos.X - window.GridSize;
                    const RightPosX = Pos.X + window.GridSize;
                    const CanMoveLeft = !Api.Particle.IsPlaceOccupied(LeftPosX, Pos.Y);
                    const CanMoveRight = !Api.Particle.IsPlaceOccupied(RightPosX, Pos.Y);
            
                    if (CanMoveLeft && CanMoveRight) {
                        const RandomDirection = Math.random() < 0.5 ? LeftPosX : RightPosX;
                        Particle.style.left = `${Math.round(RandomDirection / window.GridSize) * window.GridSize}px`;
                    } else if (CanMoveLeft) {
                        Particle.style.left = `${Math.round(LeftPosX / window.GridSize) * window.GridSize}px`;
                    } else if (CanMoveRight) {
                        Particle.style.left = `${Math.round(RightPosX / window.GridSize) * window.GridSize}px`;
                    }
                }
            } else if (Particle.dataset.Type.includes("Gas")) {
                NewVelocity = (Velocity * Api.Numeric.Random(0.65, 0.75)) + (window.Gravity || 0);
                const NewPosY = Pos.Y - NewVelocity;
                
                if (NewPosY + Particle.offsetHeight <= Api.ParticleContainer.clientHeight && !Api.Particle.IsPlaceOccupied(Pos.X, NewPosY)) {
                    Particle.style.top = `${Math.round(NewPosY / window.GridSize) * window.GridSize}px`;
                    Particle.dataset.Velocity = NewVelocity;
                } else {
                    const LeftPosX = Pos.X - window.GridSize;
                    const RightPosX = Pos.X + window.GridSize;
                    
                    const CanMoveLeft = !Api.Particle.IsPlaceOccupied(LeftPosX, Pos.Y);
                    const CanMoveRight = !Api.Particle.IsPlaceOccupied(RightPosX, Pos.Y);
                    
                    if (CanMoveLeft && CanMoveRight) {
                        const RandomDirection = Math.random() < 0.5 ? LeftPosX : RightPosX;
                        Particle.style.left = `${Math.round(RandomDirection / window.GridSize) * window.GridSize}px`;
                    } else if (CanMoveLeft) {
                        Particle.style.left = `${Math.round(LeftPosX / window.GridSize) * window.GridSize}px`;
                    } else if (CanMoveRight) {
                        Particle.style.left = `${Math.round(RightPosX / window.GridSize) * window.GridSize}px`;
                    }
                }
            } else if (Particle.dataset.Type.includes("Light")) {
                const LightDirection = JSON.parse(Particle.dataset.LightDirection);

                const NewPosX = Pos.X - (LightDirection[0] * window.GridSize);
                const NewPosY = Pos.Y - (LightDirection[1] * window.GridSize);
            
                if (Radiated.includes(String(Particle.dataset.Name).replaceAll('"', ""))) {
                    Particle.style.left = `${NewPosX}px`;
                    Particle.style.top = `${NewPosY}px`;
                } else {
                    Particle.style.left = `${Math.round(NewPosX / window.GridSize) * window.GridSize}px`;
                    Particle.style.top = `${Math.round(NewPosY / window.GridSize) * window.GridSize}px`;
                }
            }
            
            if (Particle.dataset.Type.includes("Radioactive")) {
                const Collision = Api.Particle.IsColliding(Particle);
                if (Collision[0]) {
                    const OtherPart = Collision[1];
                    if (OtherPart && ((OtherPart.dataset.Type.includes("Light") && Particle.dataset.Type.includes("Radioactive")) || (OtherPart.dataset.Type.includes("Radioactive") && Particle.dataset.Type.includes("Light")))) {
                        const DecayChance = Math.random() < 0.25;
                        if (DecayChance) {
                            Api.Particle.GeneratePart({X: parseFloat(getComputedStyle(OtherPart).left.replace("px", "")), Y: parseFloat(getComputedStyle(OtherPart).top.replace("px", "")), Snapped: false}, Api.Particle.GetElement("NEUT"));
                            Particle.remove();
                            OtherPart.remove();
                        }
                    }
                }
            }            

            if (Math.abs(Particle.offsetTop) > Api.ParticleContainer.clientHeight || Math.abs(Particle.offsetLeft) > Api.ParticleContainer.clientWidth) {
                Particle.remove();
            }
        });
    }

    requestAnimationFrame(Loop);
}

Loop();