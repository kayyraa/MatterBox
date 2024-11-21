import * as Api from "./api.js";

var Dragging = false;
var Removing = false;

var Lining = false;

var LineStartX = 0;
var LineStartY = 0;
var LineEndX = 0;
var LineEndY = 0;

var CursorRadius = 0;

var Mouse = {
    clientX: 0,
    clientY: 0,
    target: undefined
};

document.addEventListener("mouseleave", (Event) => {
    Api.CursorElement.style.opacity = 0;
});
document.addEventListener("mouseenter", (Event) => {
    Api.CursorElement.style.opacity = 1;
});

document.addEventListener("contextmenu", (Event) => {
    Event.preventDefault();
}, { passive: false });

function PlaceParticle(MouseEvent) {
    const CenterX = Math.round((MouseEvent.clientX - window.GridSize / 2) / window.GridSize) * window.GridSize;
    const CenterY = Math.round((MouseEvent.clientY - window.GridSize / 2) / window.GridSize) * window.GridSize;

    for (let OffsetX = -CursorRadius; OffsetX <= CursorRadius; OffsetX++) {
        for (let OffsetY = -CursorRadius; OffsetY <= CursorRadius; OffsetY++) {
            const Distance = Math.sqrt(OffsetX * OffsetX + OffsetY * OffsetY);
            if (Distance <= CursorRadius) {
                const GridX = CenterX + OffsetX * window.GridSize;
                const GridY = CenterY + OffsetY * window.GridSize;

                if (Dragging) {
                    if (Removing || (window.ElementSelection && window.ElementSelection.Name === "NONE")) {
                        if (Api.Particle.IsPlaceOccupied(GridX, GridY)) {
                            Api.Particle.RemovePartFromPosition(GridX, GridY);
                        }
                    } else if (!Api.Particle.IsPlaceOccupied(GridX, GridY) && (window.ElementSelection && window.ElementSelection.Name !== "NONE")) {
                        Api.Particle.GeneratePart({ X: GridX, Y: GridY, Snapped: true }, window.ElementSelection);
                    }
                }
            }
        }
    }
}

function MouseDown(Event) {
    if (Event.button === 2) {
        Removing = true;
    }
    
    if (Event.shiftKey) {
        LineStartX = Event.clientX;
        LineStartY = Event.clientY;
        Lining = true;
    }

    Dragging = true;
}

document.addEventListener("wheel", (Event) => {
    if (Event.shiftKey) {
        if (Event.deltaY > 0) {
            CursorRadius = Math.max(0, CursorRadius - 1);
        } else {
            CursorRadius = Math.min(8, CursorRadius + 1)
        }
    }
});

document.addEventListener("mousedown", MouseDown);
document.addEventListener("mouseup", (Event) => {
    Dragging = Removing = false;

    Mouse.clientX = Event.clientX;
    Mouse.clientY = Event.clientY;
    Mouse.target = Event.target;

    if (window.ElementSelection && Lining) {
        LineEndX = Event.clientX;
        LineEndY = Event.clientY;

        const Element = Api.Particle.GetElement(window.ElementSelection.Name);
        if (Element) Api.Particle.DrawLineParticle(Element, LineStartX, LineStartY, LineEndX, LineEndY);
    } else {
        LineEndX = 0;
        LineEndY = 0;
    }
    
    Api.Particle.ClearLinePlaceholder();
    Lining = false;
});

document.addEventListener("mousemove", (Event) => {
    Mouse.clientX = Event.clientX;
    Mouse.clientY = Event.clientY;
    Mouse.target = Event.target;
});

document.addEventListener("keypress", (Event) => {
    const Key = String(Event.key).toUpperCase();
    if (Key === "C") {
        Api.ParticleContainer.innerHTML = "";
    }
});

document.addEventListener("touchstart", (Event) => {
    MouseDown(Event, true);
    const Touch = Event.touches[0];
    Mouse.clientX = Touch.clientX;
    Mouse.clientY = Touch.clientY;
    Mouse.target = Event.target;
});

document.addEventListener("touchend", () => {
    Dragging = Removing = false;
});

document.addEventListener("touchcancel", () => {
    Dragging = Removing = false;
});

document.addEventListener("touchmove", (Event) => {
    const Touch = Event.touches[0];
    Mouse.clientX = Touch.clientX;
    Mouse.clientY = Touch.clientY;
    Mouse.target = Event.target;
});

new Api.ClickAndHold(document.body, (Event) => {
    return;
    LineStartX = Event.clientX || 0;
    LineStartY = Event.clientY || 0;
    Lining = true;
});

document.addEventListener("dblclick", (Event) => {
    LineStartX = Event.clientX || 0;
    LineStartY = Event.clientY || 0;
    Lining = true;
});

function Loop() {
    if (Lining) {
        Api.Particle.DrawLinePlaceholder(LineStartX, LineStartY, Mouse.clientX, Mouse.clientY);
    } else if (!Lining && Dragging) {
        PlaceParticle(Mouse);
    }

    Api.SelectionLabel.innerHTML = window.ElementSelection ? window.ElementSelection.Name : "NONE";

    Api.CursorXPosLabel.innerHTML = `X${String(Math.floor((parseInt(String(Mouse.clientX))) / window.GridSize) * window.GridSize).padStart(4, "0")}`;
    Api.CursorYPosLabel.innerHTML = `Y${String(Math.floor((parseInt(String(Mouse.clientY))) / window.GridSize) * window.GridSize).padStart(4, "0")}`;
    Api.CursorRadiusLabel.innerHTML = `${CursorRadius !== 8 ? CursorRadius + 1 : CursorRadius}r`;
    Api.CursorLineLabel.innerHTML = `${LineStartX.toString()[0]}${LineStartY.toString()[0]}${LineEndX.toString()[0]}${LineEndY.toString()[0]}`;

    Api.CursorElement.style.left = `${Mouse.clientX}px`;
    Api.CursorElement.style.top = `${Mouse.clientY}px`;
    Api.CursorElement.style.width = `${(CursorRadius * 8) + 16}px`;

    requestAnimationFrame(Loop);
}

Loop();