import * as Api from "./api.js";

let Dragging = false;
let Removing = false;
let Mouse = {
    clientX: 0,
    clientY: 0,
    target: undefined
};

document.addEventListener("contextmenu", (Event) => {
    Event.preventDefault();
}, { passive: false });

function PlaceParticle(Event) {
    const GridX = Math.round((Event.clientX - window.GridSize / 2) / window.GridSize) * window.GridSize;
    const GridY = Math.round((Event.clientY - window.GridSize / 2) / window.GridSize) * window.GridSize;

    Mouse.clientX = GridX;
    Mouse.clientY = GridY;
    Mouse.target = Event.target;

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
document.addEventListener("touchstart", (Event) => {
    MouseDown(Event);
    const Touch = Event.touches[0];
    AssignMouse(Touch.clientX, Touch.clientY, Event.target);
});

document.addEventListener("touchend", () => {
    Dragging = Removing = false;
});
document.addEventListener("touchcancel", () => {
    Dragging = Removing = false;
});
document.addEventListener("mouseup", () => {
    Dragging = Removing = false;
});

document.addEventListener("touchmove", (Event) => {
    const Touch = Event.touches[0];
    AssignMouse(Touch.clientX, Touch.clientY, Event.target);
});

document.addEventListener("mousemove", (Event) => {
    AssignMouse(Event.clientX, Event.clientY, Event.target);
});

function AssignMouse(X, Y, T) {
    Mouse.clientX = X;
    Mouse.clientY = Y;
    Mouse.target = T;
}

function Loop() {
    PlaceParticle(Mouse);
    requestAnimationFrame(Loop);
}

Loop();