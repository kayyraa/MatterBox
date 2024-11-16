import * as Api from "./api.js";
import * as Ambient from "./ambient.js";

function Loop() {
    if (Api.Particles.length > 0) {
        Api.Particles.forEach(Particle => {
            let Velocity = parseInt(Particle.dataset.Velocity) || 0;
            let NewVelocity = Velocity;

            const Pos = {
                X: Particle.offsetLeft,
                Y: Particle.offsetTop
            };

            if (Particle.dataset.Type === "Solid") {
                return;
            }

            const GridBlock = Ambient.GetClosestGridBlock(Particle.offsetLeft, Particle.offsetTop);
            if (GridBlock) {
                const CurrentTemp = parseInt(GridBlock.dataset.Temp);
                const CurrentPres = parseInt(GridBlock.dataset.Pres);
                const ParticleTemp = parseInt(Particle.dataset.Temp);
                const ParticlePres = parseFloat(Particle.dataset.Pres);
            
                GridBlock.dataset.Temp = (CurrentTemp + ParticleTemp) / 2;
                GridBlock.dataset.Pres = (CurrentPres + ParticlePres) / 2;
                Particle.dataset.Pres -= Math.max(255, Math.min(-255, ParticlePres * (1 - Number.EPSILON)));
                Particle.dataset.Temp -= Math.min(22, ParticleTemp * (1 - Number.EPSILON));
            }

            if (Particle.dataset.Type.includes("Powder")) {
                NewVelocity = Velocity + (window.Gravity || 0);
                const NewPosY = Pos.Y + NewVelocity;

                if (NewPosY + Particle.offsetHeight <= window.innerHeight && !Api.Particle.IsPlaceOccupied(Pos.X, NewPosY)) {
                    Particle.style.top = `${Math.round(NewPosY / window.GridSize) * window.GridSize}px`;
                    Particle.dataset.Velocity = NewVelocity;
                } else if (Particle.dataset.elasticity) {
                    const BounceFactor = Particle.dataset.elasticity || 0.8;
                    NewVelocity = -NewVelocity * BounceFactor;
                    const NewPosYAfterBounce = Pos.Y + NewVelocity;
                    Particle.style.top = `${Math.round(NewPosYAfterBounce / window.GridSize) * window.GridSize}px`;
                    Particle.dataset.Velocity = NewVelocity;
                } else {
                    Particle.dataset.Velocity = 0;
                }
            }

            if (Particle.dataset.Type.includes("Liquid")) {
                NewVelocity = Velocity + (window.Gravity || 0);
                const NewPosY = Pos.Y + NewVelocity;
            
                if (NewPosY + Particle.offsetHeight <= window.innerHeight && !Api.Particle.IsPlaceOccupied(Pos.X, NewPosY)) {
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
            }

            if (Particle.offsetTop > window.innerHeight || Particle.offsetLeft > window.innerWidth) {
                Particle.remove();
            }
        });
    }

    requestAnimationFrame(Loop);
}

Loop();