import * as Api from "./api.js";

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
    if (window.Playing && Api.ParticleContainer.children.length > 0) {
        Array.from(Api.ParticleContainer.children).forEach(Particle => {
            if (Particle.getAttribute("Graph")) return;

            const Name = String(Particle.dataset.Name).replaceAll('"', '').replaceAll('"', '');
            const Temp = parseInt(Particle.dataset.Temp);
            const Tmp = Particle.getAttribute("tmp");

            if (!Particle.dataset.LightDirection && Particle.dataset.Type.includes("Light")) {
                if (Radiated.includes(Name)) {
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

            Particle.setAttribute("Pos", JSON.stringify(Pos));
            Particle.dataset.Temp = Math.max(window.AmbientTemp, Temp - ((parseFloat(Particle.dataset.Melt) + Temp) / 2) / 500);

            if (Tmp !== "NULL") {
                Particle.setAttribute("tmp", Tmp - Math.floor(Api.Numeric.Random(8, 32)));
                if (parseInt(Tmp) <= 0) {
                    Particle.remove();
                }
            }

            if (parseFloat(Particle.dataset.Temp) > parseFloat(Particle.dataset.Melt)) {
                Particle.dataset.IsMolten = parseInt(Particle.dataset.NCTemp) > 60 ? "false" : "true";
                Particle.dataset.Type = Particle.dataset.Molten;
            } else if (parseFloat(Particle.dataset.Temp) < parseFloat(Particle.dataset.Melt)) {
                Particle.dataset.IsMolten = "false";
                Particle.dataset.Type = Particle.dataset.Cold;
            }

            Api.Particles.forEach(OtherParticle => {
                if (OtherParticle !== Particle) {
                    const ParticleLeft = parseFloat(Particle.style.left);
                    const ParticleTop = parseFloat(Particle.style.top);
                    const ParticleRight = ParticleLeft + Particle.offsetWidth;
                    const ParticleBottom = ParticleTop + Particle.offsetHeight;
            
                    const OtherParticleLeft = parseFloat(OtherParticle.style.left);
                    const OtherParticleTop = parseFloat(OtherParticle.style.top);
                    const OtherParticleRight = OtherParticleLeft + OtherParticle.offsetWidth;
                    const OtherParticleBottom = OtherParticleTop + OtherParticle.offsetHeight;
            
                    if (!(ParticleRight < OtherParticleLeft || 
                          ParticleLeft > OtherParticleRight || 
                          ParticleBottom < OtherParticleTop || 
                          ParticleTop > OtherParticleBottom)) {
            
                        const NewPositionX = ParticleLeft + window.GridSize;
                        const NewPositionY = ParticleTop + window.GridSize;
            
                        if (Api.Particle.IsPlaceOccupied(NewPositionX, NewPositionY)) {
                            const OtherName = String(OtherParticle.dataset.Name).replaceAll("'", "").replaceAll('"', '');
                            const OtherPos = JSON.parse(OtherParticle.getAttribute("Pos"));

                            const AverageTemp = (parseFloat(Particle.dataset.Temp) + parseFloat(OtherParticle.dataset.Temp)) / 2;
                            Particle.dataset.Temp = AverageTemp;
                            OtherParticle.dataset.Temp = AverageTemp;

                            const ApplyEffectToPart = (Radius) => {
                                Array.from(Api.ParticleContainer.children).forEach(Part => {
                                    const PartPos = JSON.parse(Part.getAttribute("Pos"));
                                    if (PartPos && PartPos.X <= Radius && PartPos.Y <= Radius) {
                                        if (Part.dataset.Type.includes("Explosive")) {
                                            ApplyEffectToPart(parseInt(JSON.parse(Part.dataset.Explosive).Charge));
                                        }
                                    
                                        const Types = Part.dataset.Type.split(",");
                                        Part.dataset.Type = Types.length > 1 
                                           ? `Powder, ${Types[Types.length - 1]}`
                                            : "Powder";
                                    }
                                });
                            }
                            
                            if (Particle.dataset.Explosive && (OtherParticle.dataset.Incendiary || parseInt(OtherParticle.dataset.Temp) > parseInt(Particle.dataset.Melt) || parseInt(Particle.dataset.Temp) > parseInt(Particle.dataset.Melt))) {
                                ApplyEffectToPart(parseInt(JSON.parse(Particle.dataset.Explosive).Charge));
                                //Particle.remove();
                            } else if (OtherParticle.dataset.Explosive && (Particle.dataset.Incendiary || parseInt(Particle.dataset.Temp) > parseInt(OtherParticle.dataset.Melt) || parseInt(OtherParticle.dataset.Temp) > parseInt(OtherParticle.dataset.Melt))) {
                                ApplyEffectToPart(parseInt(JSON.parse(OtherParticle.dataset.Explosive).Charge));
                                //OtherParticle.remove();
                            }
            
                            if (!Particle.dataset.Burning && Particle.dataset.Flammable && JSON.parse(Particle.dataset.Flammable)[0] && OtherParticle.dataset.Incendiary) {
                                Particle.dataset.Burning = true;
                                const FlammableData = JSON.parse(Particle.dataset.Flammable);
                                const Residue = FlammableData[1][Math.floor(Math.random() * FlammableData[1].length)];
                                
                                Api.Particle.GeneratePart(
                                    { X: parseInt(Particle.style.left), Y: parseInt(Particle.style.top) - window.GridSize, Snapped: true },
                                    Api.Particle.GetElement(Residue)
                                );
                                OtherParticle.remove();
                                Particle.remove();

                                return;
                            } else if (!OtherParticle.dataset.Burning && Particle.dataset.Incendiary && OtherParticle.dataset.Flammable && JSON.parse(OtherParticle.dataset.Flammable)[0]) {
                                OtherParticle.dataset.Burning = true;
                                const FlammableData = JSON.parse(OtherParticle.dataset.Flammable);
                                const Residue = FlammableData[1][Math.floor(Math.random() * FlammableData[1].length)];
                                
                                Api.Particle.GeneratePart(
                                    { X: parseInt(OtherParticle.style.left), Y: parseInt(OtherParticle.style.top) - window.GridSize, Snapped: true },
                                    Api.Particle.GetElement(Residue)
                                );
                                OtherParticle.remove();
                                Particle.remove();

                                return;
                            }
            
                            if (Particle.dataset.Acid && JSON.parse(Particle.dataset.Acid).Eating.includes(OtherName)) {
                                const AcidData = JSON.parse(Particle.dataset.Acid);
                                let Residue = AcidData.Acid.Residue;
                                Residue = Residue[0];
                                setTimeout(() => {
                                    Api.Particle.GeneratePart(
                                        { X: parseInt(Particle.style.left), Y: parseInt(Particle.style.top), Snapped: true },
                                        Api.Particle.GetElement(Residue)
                                    );
                                    Particle.remove();
                                    OtherParticle.remove();
                                }, 250);
                            }
            
                            if (Particle.dataset.Loop && JSON.parse(Particle.dataset.Loop)[1]) {
                                if (JSON.parse(Particle.dataset.Loop)[0]) {
                                    const PRTOS = Api.ParticleContainer.querySelectorAll(`div[data--name='"PRTO"']`);
                                    PRTOS.forEach(PRTO => {
                                        Api.Particle.GeneratePart(
                                            { X: parseInt(PRTO.style.left), Y: parseInt(PRTO.style.top) + window.GridSize, Snapped: true },
                                            Api.Particle.GetElement(OtherName)
                                        );
                                        OtherParticle.remove();
                                    });
                                }
                            }
            
                            if (Name === "VOID" && OtherName !== "VOID") {
                                OtherParticle.remove();
                            }
                        }
                    }
                }
            });            

            if (Particle.dataset.Type.includes("Powder")) {
                const NewPosY = Pos.Y + window.GridSize;

                if ((NewPosY + Particle.offsetHeight) <= Api.ParticleContainer.clientHeight && !Api.Particle.IsPlaceOccupied(Pos.X, NewPosY)) {
                    Particle.style.top = `${Math.round(NewPosY / window.GridSize) * window.GridSize}px`;
                }
            } else if (Particle.dataset.Type.includes("Liquid")) {
                const NewPosY = Pos.Y + window.GridSize;
            
                if (NewPosY + Particle.offsetHeight <= Api.ParticleContainer.clientHeight && !Api.Particle.IsPlaceOccupied(Pos.X, NewPosY)) {
                    Particle.style.top = `${Math.round(NewPosY / window.GridSize) * window.GridSize}px`;
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
            } else if (Particle.dataset.Type.includes("Gas")) {
                const NewPosY = Pos.Y - window.GridSize;
                
                if (NewPosY + Particle.offsetHeight <= Api.ParticleContainer.clientHeight && !Api.Particle.IsPlaceOccupied(Pos.X, NewPosY)) {
                    Particle.style.top = `${Math.round(NewPosY / window.GridSize) * window.GridSize}px`;
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
            
                if (Radiated.includes(Particle.dataset.Name)) {
                    Particle.style.left = `${NewPosX}px`;
                    Particle.style.top = `${NewPosY}px`;
                } else {
                    Particle.style.left = `${Math.round(NewPosX / window.GridSize) * window.GridSize}px`;
                    Particle.style.top = `${Math.round(NewPosY / window.GridSize) * window.GridSize}px`;
                }
            }
            
            if (Particle.dataset.Type.includes("Radioactive") && Particle.dataset.Type.includes("Light")) {
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
            } else if (Particle.dataset.Type.includes("Radioactive") && !Particle.dataset.Type.includes("Light")) {
                if (parseInt(Particle.getAttribute("tmp")) <= 5000 ) {
                    Api.Particle.GeneratePart({X: parseFloat(getComputedStyle(Particle).left.replace("px", "")), Y: parseFloat(getComputedStyle(Particle).top.replace("px", "")), Snapped: false}, Api.Particle.GetElement("NEUT"));
                    Particle.remove();
                }
            }

            if (Math.abs(Particle.offsetTop) > window.innerHeight || Math.abs(Particle.offsetLeft) > window.innerWidth) {
                Particle.remove();
            }
        });
    }

    setTimeout(Loop, 0);
    //requestAnimationFrame(Loop);
}

Loop();