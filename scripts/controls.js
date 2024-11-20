import * as Api from "./api.js";

let Dragging = false;
let Removing = false;
var Lining = false;
var LineStartX = 0;
var LineStartY = 0;
var LineEndX = 0;
var LineEndY = 0;
let Mouse = {
    clientX: 0,
    clientY: 0,
    target: undefined
};

document.addEventListener("contextmenu", (Event) => {
    Event.preventDefault();
}, { passive: false });

function PlaceParticle(MouseEvent) {
    const GridX = Math.round((MouseEvent.clientX - window.GridSize / 2) / window.GridSize) * window.GridSize;
    const GridY = Math.round((MouseEvent.clientY - window.GridSize / 2) / window.GridSize) * window.GridSize;

    if (Dragging) {
        if (Removing && Api.Particle.IsPlaceOccupied(GridX, GridY)) {
            Api.Particle.RemovePartFromPosition(GridX, GridY);
        } else if (!Removing && window.ElementSelection && window.ElementSelection.Name && window.ElementSelection.Name !== "NONE" && !Api.Particle.IsPlaceOccupied(GridX, GridY)) {
            Api.Particle.GeneratePart({ X: GridX, Y: GridY, Snapped: true }, window.ElementSelection);
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

document.addEventListener("mousedown", MouseDown);
document.addEventListener("mouseup", (Event) => {
    Dragging = Removing = false;

    Mouse.clientX = Event.clientX;
    Mouse.clientY = Event.clientY;
    Mouse.target = Event.target;

    LineEndX = Event.clientX;
    LineEndY = Event.clientY;

    if (window.ElementSelection && Lining) {
        const Element = Api.Particle.GetElement(window.ElementSelection.Name);
        if (Element) Api.Particle.DrawLineParticle(Element, LineStartX, LineStartY, LineEndX, LineEndY);
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

export let IsMobile = false;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);

if (IsMobile) {
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
}

new Api.ClickAndHold(document.body, (Event) => {
    LineStartX = Event.clientX;
    LineStartY = Event.clientY;
    Lining = true;
});

function Loop() {
    if (Lining) {
        Api.Particle.DrawLinePlaceholder(LineStartX, LineStartY, Mouse.clientX, Mouse.clientY);
    } else if (!Lining && Dragging) {
        PlaceParticle(Mouse);
    }
    requestAnimationFrame(Loop);
}

Loop();