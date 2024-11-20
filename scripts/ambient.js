import * as Api from "./api.js";

const CubeSize = window.Ambient.Quality;
const ScreenWidth = window.innerWidth;
const ScreenHeight = window.innerHeight;

const CubesPerRow = Math.ceil(ScreenWidth / CubeSize);
const CubesPerColumn = Math.ceil(ScreenHeight / CubeSize);

const TotalCubes = CubesPerRow * CubesPerColumn;
const Ambient = document.querySelector(".Ambient");

const Cubes = [];

for (let Index = 0; Index < TotalCubes; Index++) {
    if (window.Ambient.Enabled) {
        const Cube = document.createElement("div");
        Cube.classList.add("Cube");
        
        const CubeX = (Index % CubesPerRow) * CubeSize;
        const CubeY = Math.floor(Index / CubesPerRow) * CubeSize;
        
        Cube.dataset.x = CubeX;
        Cube.dataset.y = CubeY;
        Cube.dataset.Temp = "0";
        Cube.dataset.Pres = "0";
        
        Cube.style.width = `${CubeSize}px`;
        
        Ambient.appendChild(Cube);
        Cubes.push(Cube);
    };
}

export function GetClosestGridBlock(x, y) {
    const GridX = Math.floor(x / CubeSize) * CubeSize;
    const GridY = Math.floor(y / CubeSize) * CubeSize;

    return GetGridBlock(GridX, GridY);
}

export function GetGridBlock(x, y) {
    for (let Cube of Ambient.children) {
        if (parseInt(Cube.dataset.x) === x && parseInt(Cube.dataset.y) === y) {
            return Cube;
        }
    }
    return null;
}

function Loop() {
    if (Api.Particles.length > 0) {
        Api.Particles.forEach(Particle => {
            let CurrentTemp = parseFloat(Particle.dataset.Temp);
            let TempDifference = CurrentTemp - window.Ambient.Temp;

            if (TempDifference !== 0) {
                let TempAdjustment = TempDifference * Api.Numeric.Random(0.000000625, 0.0000625);
                Particle.dataset.Temp = (CurrentTemp - TempAdjustment).toString();
            }
        });
    }
    requestAnimationFrame(Loop);
}

function DissipateTemperature() {
    Cubes.forEach((Cube, Index) => {
        if (!Cube) return;

        let CurrentTemp = parseFloat(Cube.dataset.Temp);
        if (isNaN(CurrentTemp)) return;

        const Neighbors = [];

        if (Index % CubesPerRow !== 0) Neighbors.push(Cubes[Index - 1]);
        if ((Index + 1) % CubesPerRow !== 0) Neighbors.push(Cubes[Index + 1]);
        if (Index >= CubesPerRow) Neighbors.push(Cubes[Index - CubesPerRow]);
        if (Index < Cubes.length - CubesPerRow) Neighbors.push(Cubes[Index + CubesPerRow]);

        Neighbors.forEach(Neighbor => {
            if (!Neighbor) return;

            let NeighborTemp = parseFloat(Neighbor.dataset.Temp);
            const TempDifference = CurrentTemp - NeighborTemp;
            Neighbor.dataset.Temp = (NeighborTemp + TempDifference * 0.05).toString();
        });

        const TempColor = Math.min(255, Math.floor((CurrentTemp / 1000) * 255));
        Cube.style.backgroundColor = `rgb(${TempColor}, 0, ${255 - TempColor})`;

        Cube.innerHTML = `${Math.floor(CurrentTemp)}⁰C`;
    });

    requestAnimationFrame(DissipateTemperature);
}

function DissipatePressure() {
    Cubes.forEach((Cube, Index) => {
        if (!Cube) return;

        let CurrentPres = parseFloat(Cube.dataset.Pres);
        if (isNaN(CurrentPres)) return;

        const Neighbors = [];

        if (Index % CubesPerRow !== 0) Neighbors.push(Cubes[Index - 1]);
        if ((Index + 1) % CubesPerRow !== 0) Neighbors.push(Cubes[Index + 1]);
        if (Index >= CubesPerRow) Neighbors.push(Cubes[Index - CubesPerRow]);
        if (Index < Cubes.length - CubesPerRow) Neighbors.push(Cubes[Index + CubesPerRow]);

        Neighbors.forEach(Neighbor => {
            if (!Neighbor) return;

            let NeighborPres = parseFloat(Neighbor.dataset.Pres);
            const PresDifference = CurrentPres - NeighborPres;
            Neighbor.dataset.Pres = (NeighborPres + PresDifference * 0.05).toString();
        });

        const PresColor = Math.min(255, Math.floor((CurrentPres / 255) * 255));
        Cube.style.backgroundColor = `rgb(${PresColor}, 0, ${255 - PresColor})`;

        Cube.innerHTML += `\n${Math.floor(CurrentPres)}Pa`;
    });

    requestAnimationFrame(DissipatePressure);
}

Loop();
DissipateTemperature();
DissipatePressure();