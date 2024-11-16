import * as Api from "./api.js";

let Dragging = false;
let Removing = false;

document.addEventListener("contextmenu", (Event) => {
    Event.preventDefault();
}, {passive: false});

document.addEventListener("mousedown", (Event) => {
    const GridX = Math.round((Event.clientX - window.GridSize / 2) / window.GridSize) * window.GridSize;
    const GridY = Math.round((Event.clientY - window.GridSize / 2) / window.GridSize) * window.GridSize;

    if (Event.button === 2) {
        Removing = true;
    }
    Dragging = true;

    if (!Removing && window.ElementSelection && window.ElementSelection.Name !== "NONE" && !Api.Particle.IsPlaceOccupied(GridX, GridY)) {
        Api.Particle.GeneratePart(GridX, GridY, window.ElementSelection);
    }
});

document.addEventListener("mouseup", () => {
    Dragging = Removing = false;
});

document.addEventListener("mousemove", (Event) => {
    const GridX = Math.round((Event.clientX - window.GridSize / 2) / window.GridSize) * window.GridSize;
    const GridY = Math.round((Event.clientY - window.GridSize / 2) / window.GridSize) * window.GridSize;

    if (Dragging && !Removing && window.ElementSelection && (window.ElementSelection.Name && window.ElementSelection.Name !== "NONE") && !Api.Particle.IsPlaceOccupied(GridX, GridY)) {
        Api.Particle.GeneratePart(GridX, GridY, window.ElementSelection);
    } else if (Dragging && (Removing || ((window.ElementSelection && window.ElementSelection.Name) && window.ElementSelection.Name === "NONE")) && Api.Particle.IsPlaceOccupied(GridX, GridY)) {
        Api.Particle.RemovePartFromPosition(GridX, GridY);
    }
});