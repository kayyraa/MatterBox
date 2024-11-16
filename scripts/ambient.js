const CubeSize = 64;
const ScreenWidth = window.innerWidth;
const ScreenHeight = window.innerHeight;

const CubesPerRow = Math.ceil(ScreenWidth / CubeSize);
const CubesPerColumn = Math.ceil(ScreenHeight / CubeSize);

const TotalCubes = CubesPerRow * CubesPerColumn;
const Ambient = document.querySelector(".Ambient");

const Cubes = [];
let MaxTemp = 0;
let MaxPres = 0; // Track max pressure

for (let Index = 0; Index < TotalCubes; Index++) {
    const Cube = document.createElement("div");
    Cube.classList.add("Cube");

    const CubeX = (Index % CubesPerRow) * CubeSize;
    const CubeY = Math.floor(Index / CubesPerRow) * CubeSize;

    Cube.dataset.x = CubeX;
    Cube.dataset.y = CubeY;
    Cube.dataset.Temp = "0";  // Temperature initialized to 0
    Cube.dataset.pres = "0";  // Pressure initialized to 0
    
    Ambient.appendChild(Cube);
    Cubes.push(Cube);
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
    return null; // Return null if no cube is found
}

function DissipateTemperature() {
    Cubes.forEach((Cube, Index) => {
        if (!Cube) return;

        let CurrentTemp = parseFloat(Cube.dataset.Temp);
        if (isNaN(CurrentTemp)) return;

        if (CurrentTemp > MaxTemp) MaxTemp = CurrentTemp;

        const Neighbors = [];

        // Get the neighboring cubes
        if (Index % CubesPerRow !== 0) Neighbors.push(Cubes[Index - 1]); // Left
        if ((Index + 1) % CubesPerRow !== 0) Neighbors.push(Cubes[Index + 1]); // Right
        if (Index >= CubesPerRow) Neighbors.push(Cubes[Index - CubesPerRow]); // Top
        if (Index < Cubes.length - CubesPerRow) Neighbors.push(Cubes[Index + CubesPerRow]); // Bottom

        // Dissipate temperature to neighbors
        Neighbors.forEach(Neighbor => {
            if (!Neighbor) return;

            let NeighborTemp = parseFloat(Neighbor.dataset.Temp);
            const TempDifference = CurrentTemp - NeighborTemp;
            Neighbor.dataset.Temp = (NeighborTemp + TempDifference * 0.05).toString();
        });

        // Adjust opacity based on temperature
        const Opacity = Math.min(1, CurrentTemp / MaxTemp);
        Cube.style.opacity = Opacity;

        // Display the temperature in the cube
        Cube.innerHTML = `${Math.floor(CurrentTemp)}⁰C`;
    });

    requestAnimationFrame(DissipateTemperature); // Continue the loop
}

function DissipatePressure() {
    Cubes.forEach((Cube, Index) => {
        if (!Cube) return;

        let CurrentPres = parseFloat(Cube.dataset.pres);
        if (isNaN(CurrentPres)) return;

        if (CurrentPres > MaxPres) MaxPres = CurrentPres;

        const Neighbors = [];

        // Get the neighboring cubes
        if (Index % CubesPerRow !== 0) Neighbors.push(Cubes[Index - 1]); // Left
        if ((Index + 1) % CubesPerRow !== 0) Neighbors.push(Cubes[Index + 1]); // Right
        if (Index >= CubesPerRow) Neighbors.push(Cubes[Index - CubesPerRow]); // Top
        if (Index < Cubes.length - CubesPerRow) Neighbors.push(Cubes[Index + CubesPerRow]); // Bottom

        // Dissipate pressure to neighbors
        Neighbors.forEach(Neighbor => {
            if (!Neighbor) return;

            let NeighborPres = parseFloat(Neighbor.dataset.pres);
            const PresDifference = CurrentPres - NeighborPres;
            Neighbor.dataset.pres = (NeighborPres + PresDifference * 0.05).toString();
        });

        // Adjust opacity based on pressure
        const Opacity = Math.min(1, CurrentPres / MaxPres);
        Cube.style.opacity = Opacity;

        // Display the pressure in the cube
        Cube.innerHTML += `\n${Math.floor(CurrentPres)}Pa`;
    });

    requestAnimationFrame(DissipatePressure); // Continue the loop
}

// Start the dissipation processes
DissipateTemperature();
DissipatePressure();
