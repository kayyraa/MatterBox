import { Elements, Types } from "./elements.js";
import * as Api from "./api.js";

const TypeList = document.querySelector(".TypeList");
const Selector = document.querySelector(".Selector");

const FpsLabel = document.querySelector(".FpsLabel");
const ParticlesLabel = document.querySelector(".ParticlesLabel");

Elements.forEach(Element => {
    let ElementPropertyData = {};
    Object.keys(Element).forEach(Property => {
        ElementPropertyData[Property] = Element[Property];
    });

    const ElementDiv = document.createElement("div");
    ElementDiv.innerHTML = String(Element.Name).toUpperCase().slice(0, 4);
    ElementDiv.style.backgroundColor = Element.Color;
    ElementDiv.dataset.properties = JSON.stringify(ElementPropertyData);
    Selector.querySelector(`.${Element.Type}`).appendChild(ElementDiv);

    ElementDiv.addEventListener("click", () => {
        window.ElementSelection = Element;
    });
});

Types.forEach(Type => {
    const TypeName = Type[0];
    const TypeIcon = Type[1];

    const TypeElement = document.createElement("div");
    TypeElement.classList.add(TypeName);
    TypeList.appendChild(TypeElement);

    const TypeIconElement = document.createElement("img");
    TypeIconElement.src = TypeIcon;
    TypeElement.appendChild(TypeIconElement);

    const TypeNameElement = document.createElement("span");
    TypeNameElement.innerHTML = TypeName;
    TypeElement.appendChild(TypeNameElement);

    TypeElement.addEventListener("click", () => {
        Selector.querySelector(`.${TypeName}`).style.display = "flex";
        Array.from(Selector.children).forEach(OtherSelector => {
            if (!OtherSelector.classList.contains(TypeName)) {
                OtherSelector.style.display = "";
            }
        })
    });
});

let LastTime = performance.now();
let FrameCount = 0;

function Loop() {
    ParticlesLabel.innerHTML = `Parts: ${Api.ParticleContainer.children.length}`;

    const CurrentTime = performance.now();
    const ElapsedTime = CurrentTime - LastTime;

    if (ElapsedTime > 125) {
        const Fps = Math.floor(FrameCount / (ElapsedTime / 1000));
        FpsLabel.innerHTML = `FPS: ${Fps}`;
        LastTime = CurrentTime;
        FrameCount = 0;
    } else {
        FrameCount++;
    }

    requestAnimationFrame(Loop);
}

Loop();