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

            const PartAttributes = Array.from(Particle.attributes).reduce((Object, Attribute) => {
                const Name = Attribute.name.replace(/['"]/g, "");
                Object[Name.charAt(0).toUpperCase() + Name.slice(1)] = Attribute.value.replace(/['"]/g, "");
                return Object;
            }, {});

            const Name = PartAttributes.Name;
            const Type = PartAttributes.Type;
            const Temp = parseFloat(PartAttributes.Temp);
            const Tmp = Particle.hasAttribute("tmp") ? PartAttributes.Tmp : "NULL";
            
            if (!Particle.hasAttribute("LightDirection") && Type.includes("Light")) {
                if (Radiated.includes(Name)) {
                    const Angle = Math.random() * 2 * Math.PI;
                    Particle.setAttribute("LightDirection", JSON.stringify([Math.cos(Angle), Math.sin(Angle)]));
                } else {
                    Particle.setAttribute("LightDirection", JSON.stringify(Directions[Math.floor(Math.random() * Directions.length)]));
                }
            }

            const Pos = {
                X: Particle.offsetLeft,
                Y: Particle.offsetTop
            };

            Particle.setAttribute("Pos", JSON.stringify(Pos));
            if (Temp > window.AmbientTemp) {
                Particle.setAttribute("Temp", Temp - Temp / 750);
            } else if (Temp < window.AmbientTemp) {
                let MeltPoint = Math.abs(parseInt(PartAttributes.Melt) || 0);
                Particle.setAttribute("Temp", Temp - Temp / (3500 + MeltPoint));
            }
            

            const ParticleColorArray = PartAttributes.Color.match(/\d+/g).map(Number);
            Particle.style.backgroundColor = `rgb(${ParticleColorArray[0] + (Temp - 32)}, ${ParticleColorArray[1]}, ${ParticleColorArray[2]})`;

            if (Tmp !== "NULL") {
                Particle.setAttribute("tmp", Tmp - Math.floor(Api.Numeric.Random(8, 32)));
                if (parseInt(Tmp) <= 0) {
                    Particle.remove();
                }
            }

            if (Temp > parseFloat(PartAttributes.Melt)) {
                Particle.setAttribute("IsMolten", parseInt(PartAttributes.Nctemp) > 60 ? false : true);
                Particle.setAttribute("Type", PartAttributes.Molten.replace(/['"]/g, ""));
            } else if (Temp < parseFloat(PartAttributes.Melt)) {
                Particle.setAttribute("IsMolten", false);
                Particle.setAttribute("Type", PartAttributes.Nctype);
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
                            const OtherName = String(OtherParticle.getAttribute("Name")).replace(/['"]/g, "");

                            const AverageTemp = (Temp + (isNaN(parseFloat(OtherParticle.getAttribute("Temp") || 0)) ? 0 : parseFloat(OtherParticle.getAttribute("Temp") || 0))) / 2;
                            Particle.setAttribute("Temp", AverageTemp);
                            OtherParticle.setAttribute("Temp", AverageTemp);
            
                            if (!Particle.hasAttribute("Burning") && Particle.hasAttribute("Flammable") && JSON.parse(Particle.getAttribute("Flammable"))[0] && OtherParticle.hasAttribute("Incendiary")) {
                                Api.Particle.BurnParticle(Particle);
                                if (Math.random() < 0.125) {
                                    OtherParticle.remove();
                                }
                                return;
                            } else if (!OtherParticle.hasAttribute("Burning") && Particle.hasAttribute("Incendiary") && OtherParticle.getAttribute("Flammable") && JSON.parse(OtherParticle.getAttribute("Flammable"))[0]) {
                                Api.Particle.BurnParticle(OtherParticle);
                                if (Math.random() < 0.125) {
                                    Particle.remove();
                                }
                                return;
                            }
            
                            if (Particle.hasAttribute("Acid") && JSON.parse(Particle.getAttribute("Acid")).Eating.includes(OtherName)) {
                                const AcidData = JSON.parse(Particle.getAttribute("Acid"));
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
            
                            if (Particle.hasAttribute("Loop") && JSON.parse(Particle.getAttribute("Loop"))[1]) {
                                if (JSON.parse(Particle.getAttribute("Loop"))[0]) {
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

                            if (Particle.hasAttribute("Clone")) {
                                if (Particle.getAttribute("Clone") === "undefined") {
                                    Particle.setAttribute("Clone", JSON.stringify(Api.Particle.GetElement(String(OtherName))));
                                    return;
                                }
                            }                            
            
                            if (Name === "VOID" && OtherName !== "VOID") {
                                OtherParticle.remove();
                            }
                        }
                    }
                }
            });

            if (Particle.hasAttribute("Clone") && Particle.getAttribute("Clone") !== "undefined") {
                const ParsedClone = JSON.parse(Particle.getAttribute("Clone"));
                const ParticleLeft = parseInt(Particle.style.left);
                const ParticleTop = parseInt(Particle.style.top);
                
                Api.Particle.GeneratePart({
                    X: ParticleLeft,
                    Y: ParticleTop + window.GridSize,
                    Snapped: true
                }, ParsedClone);
            }

            const Offset = [
                [1 ,  0],
                [-1,  0],
                [0 ,  1],
                [0 , -1],
            ];
            
            Offset.forEach(Item => {
                const Neighbor = document.elementFromPoint(
                    Math.floor((Pos.X + (Item[0] * window.GridSize)) * window.GridSize) / window.GridSize,
                    Math.floor((Pos.Y + (Item[1] * window.GridSize)) * window.GridSize) / window.GridSize
                );
                if (Neighbor === Api.ParticleContainer) return;
                if (!Neighbor) return;

                if (parseFloat(Neighbor.getAttribute("Temp")) === Temp) return;
                
                const AverageTemp = (Temp + (isNaN(parseFloat(Neighbor.getAttribute("Temp") || 0)) ? 0 : parseFloat(Neighbor.getAttribute("Temp") || 0))) / 2;
                Particle.setAttribute("Temp", AverageTemp);
                Neighbor.setAttribute("Temp", AverageTemp);
            });

            if (Type.includes("Powder")) {
                const NewPosY = Pos.Y + window.GridSize;

                if (window.EdgeMode === "Void" && NewPosY + Particle.offsetHeight > Api.ParticleContainer.clientHeight) {
                    Particle.remove();
                }

                if ((NewPosY + Particle.offsetHeight) <= Api.ParticleContainer.clientHeight && !Api.Particle.IsPlaceOccupied(Pos.X, NewPosY)) {
                    Particle.style.top = `${Math.round(NewPosY / window.GridSize) * window.GridSize}px`;
                }
            } else if (Type.includes("Liquid")) {
                const NewPosY = Pos.Y + window.GridSize;
 
                if (window.EdgeMode === "Void" && NewPosY + Particle.offsetHeight > Api.ParticleContainer.clientHeight) {
                    Particle.remove();
                }
            
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
            } else if (Type.includes("Gas")) {
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
            } else if (Type.includes("Light")) {
                const LightDirection = JSON.parse(Particle.getAttribute("LightDirection"));

                const NewPosX = Pos.X - (LightDirection[0] * window.GridSize);
                const NewPosY = Pos.Y - (LightDirection[1] * window.GridSize);
            
                if (Radiated.includes(Name)) {
                    Particle.style.left = `${NewPosX}px`;
                    Particle.style.top = `${NewPosY}px`;
                } else {
                    Particle.style.left = `${Math.round(NewPosX / window.GridSize) * window.GridSize}px`;
                    Particle.style.top = `${Math.round(NewPosY / window.GridSize) * window.GridSize}px`;
                }
            }
            
            if (Type.includes("Radioactive") && !Type.includes("Light")) {
                if (Math.random() < Math.pow(10, -2)) {
                    Api.Particle.GeneratePart({X: Pos.X, Y: Pos.Y, Snapped: true}, Api.Particle.GetElement("NEUT"), undefined, true);
                    Particle.setAttribute("Temp", Temp + Api.Numeric.Random(32, 512));
                    if (Math.random() < Math.pow(10, -2)) {
                        Api.Particle.GeneratePart({X: Pos.X, Y: Pos.Y, Snapped: true}, Api.Particle.GetElement("STNE"), undefined, true);
                        if (Math.random() < Math.pow(10, -2)) {
                            Particle.remove();
                        }
                    }
                }
            }

            if (Math.abs(Particle.offsetTop) > window.innerHeight || Math.abs(Particle.offsetLeft) > window.innerWidth) {
                Particle.remove();
            }
        });
    }

    requestAnimationFrame(Loop);
}

Loop();