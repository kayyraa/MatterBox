import * as Api from "./api.js";

let Dragging = false;
let Removing = false;
let Mouse = {
    clientX: 0,
    clientY: 0
};

document.addEventListener("contextmenu", (Event) => {
    Event.preventDefault();
}, {passive: false});

function PlaceParticle(Event) {
    const GridX = Math.round((Event.clientX - window.GridSize / 2) / window.GridSize) * window.GridSize;
    const GridY = Math.round((Event.clientY - window.GridSize / 2) / window.GridSize) * window.GridSize;

    Mouse.clientX = GridX;
    Mouse.clientY = GridY;

    if (Dragging && !Removing && window.ElementSelection && (window.ElementSelection.Name && window.ElementSelection.Name !== "NONE") && !Api.Particle.IsPlaceOccupied(GridX, GridY)) {
        Api.Particle.GeneratePart(GridX, GridY, window.ElementSelection);
    } else if (Dragging && (Removing || ((window.ElementSelection && window.ElementSelection.Name) && window.ElementSelection.Name === "NONE")) && Api.Particle.IsPlaceOccupied(GridX, GridY)) {
        Api.Particle.RemovePartFromPosition(GridX, GridY);
    }
}

function MouseDown(Event) {
    if (Event.button === 2) {
        Removing = true;
    }
    Dragging = true;
}

document.addEventListener("mousedown", MouseDown);
document.addEventListener("touchstart", MouseDown);

document.addEventListener("touchend", () => {
    Dragging = Removing = false;
});
document.addEventListener("mouseup", () => {
    Dragging = Removing = false;
});

document.addEventListener("touchmove", PlaceParticle);
document.addEventListener("mousemove", PlaceParticle);

function Loop() {
    PlaceParticle(Mouse);
    requestAnimationFrame(Loop);
}

Loop();