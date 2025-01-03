const CubeSize = 64;
const ScreenWidth = window.innerWidth;
const ScreenHeight = window.innerHeight;

const CubesPerRow = Math.ceil(ScreenWidth / CubeSize);
const CubesPerColumn = Math.ceil(ScreenHeight / CubeSize);

const TotalCubes = CubesPerRow * CubesPerColumn;
const Ambient = document.querySelector(".Ambient");

const Cubes = [];

for (let Index = 0; Index < TotalCubes; Index++) {
    const Cube = document.createElement("div");
    Cube.classList.add("Cube");
    
    const CubeX = (Index % CubesPerRow) * CubeSize;
    const CubeY = Math.floor(Index / CubesPerRow) * CubeSize;
    
    Cube.setAttribute("X", CubeX);
    Cube.setAttribute("Y", CubeY);
    Cube.setAttribute("Temp", window.AmbientTemp);
    Cube.setAttribute("Id", Index);
    
    Cube.style.width = `${CubeSize}px`;
    
    Ambient.appendChild(Cube);
    Cubes.push(Cube);
}

export function GetClosestGridBlock(X, Y) {
    const GridBlock = Ambient.querySelector(`div[X="${X}"][Y="${Y}"]`);
    if (GridBlock) return GridBlock;
    return null;
}

export function SuperSetEvery(SuperSet = [[]]) {
    SuperSet.forEach(Set => {
        Cubes.forEach(Cube => {
            Cube.setAttribute(Set[0], Set[1]);
        });
    });
}

function DissipateTemperature() {
    Cubes.forEach((Cube, Index) => {
        if (!Cube) return;

        let CurrentTemp = parseFloat(Cube.getAttribute("Temp"));
        if (isNaN(CurrentTemp)) return;

        const Neighbors = [];

        if (Index % CubesPerRow !== 0) Neighbors.push(Cubes[Index - 1]);
        if ((Index + 1) % CubesPerRow !== 0) Neighbors.push(Cubes[Index + 1]);
        if (Index >= CubesPerRow) Neighbors.push(Cubes[Index - CubesPerRow]);
        if (Index < Cubes.length - CubesPerRow) Neighbors.push(Cubes[Index + CubesPerRow]);

        Neighbors.forEach(Neighbor => {
            if (!Neighbor) return;

            let NeighborTemp = parseFloat(Neighbor.getAttribute("Temp"));
            const TempDifference = CurrentTemp - NeighborTemp;
            Neighbor.setAttribute("Temp", (NeighborTemp + TempDifference * 0.0125).toString());
        });

        const TempColor = Math.min(255, Math.floor((CurrentTemp / 2000) * 255));
        Cube.style.backgroundColor = window.Display === "Heat" ? `rgb(${TempColor}, 0, ${255 - TempColor})` : "";
        //Cube.style.zIndex = window.Display === "Heat" ? 2 : -6;
        Cube.innerHTML = window.Display === "Heat" ? `${Math.floor(CurrentTemp)}C` : "";
    });

    requestAnimationFrame(DissipateTemperature);
}

DissipateTemperature();