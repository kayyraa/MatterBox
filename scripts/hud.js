import { Elements, Types } from "./elements.js";
import * as Api from "./api.js";

const TypeList = document.querySelector(".TypeList");
const SimulationSetsList = document.querySelector(".SimulationSettingsList");
const Selector = document.querySelector(".Selector");
window.Selector = Selector;

const FpsLabel = document.querySelector(".FpsLabel");
const PerformanceLabel = document.querySelector(".PerformanceLabel");
const ParticlesLabel = document.querySelector(".ParticlesLabel");

window.ElementSelection = Api.Particle.GetElement("DUST");

Elements.forEach(Element => {
    let ElementPropertyData = {};
    Object.keys(Element).forEach(Property => {
        ElementPropertyData[Property] = Element[Property];
    });

    const ElementDiv = document.createElement("div");
    ElementDiv.innerHTML = Element.Icon ? `<img src="${Element.Icon}">` : String(Element.Name).toUpperCase();
    ElementDiv.style.backgroundColor = Element.Color;
    const [R, G, B] = Element.Color.match(/\d+/g).map(Number);
    (0.299 * R + 0.587 * G + 0.114 * B) / 255 < 0.25 ? ElementDiv.style.color = "rgb(255, 255, 255)" : ElementDiv.style.color = "rgb(0, 0, 0)";
    ElementDiv.setAttribute("Properties", JSON.stringify(ElementPropertyData));

    if (Selector.querySelector(`.${String(Element.Type.includes(",") && Element.Type.includes("Gas") ? Element.Type.split(",")[1] : Element.Type).trim()}`)) {
        Selector.querySelector(`.${String(Element.Type.includes(",") && Element.Type.includes("Gas") ? Element.Type.split(",")[1] : Element.Type).trim()}`).appendChild(ElementDiv)
        
        ElementDiv.addEventListener("click", () => {
            window.ElementSelection = Element;
        });
    }
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
    TypeNameElement.innerHTML = TypeName.replace("None", "Special");
    TypeElement.appendChild(TypeNameElement);

    TypeElement.addEventListener("click", () => {
        Selector.querySelector(`.${TypeName}`).style.display = "flex";
        Selector.querySelector(`.${TypeName}`).style.opacity = "1";
        TypeElement.style.backgroundColor = "white";
        TypeElement.querySelector("img").style.filter = "invert(100%) brightness(0%)";

        Array.from(Selector.children).forEach(OtherSelector => {
            if (!OtherSelector.classList.contains(TypeName)) OtherSelector.style.display = "";
        })

        Array.from(TypeList.children).forEach(OtherType => {
            if (OtherType !== TypeElement) {
                OtherType.style.backgroundColor = "";
                OtherType.querySelector("img").style.filter = "";
            }
        });
    });
});

TypeList.querySelector(".Powder").click();

Array.from(SimulationSetsList.children).forEach(SimulationSetting => {
    SimulationSetting.dataset.Enabled = "false";

    SimulationSetting.addEventListener("click", () => {
        SimulationSetting.dataset.Enabled = SimulationSetting.dataset.Enabled === "true" ? "false" : "true";

        if (!SimulationSetting.hasAttribute("effect")) return;

        const EffectState = SimulationSetting.getAttribute("effect").split(" ").pop();
        const NewEffect = SimulationSetting.getAttribute("effect").replace(EffectState, "") + String(SimulationSetting.dataset.Enabled).replaceAll('"', '').replaceAll("'", "");
        
        eval(NewEffect);

        if (SimulationSetting.dataset.Enabled === "true") {
            SimulationSetting.style.backgroundColor = "white";
            SimulationSetting.style.color = "black";
        } else {
            SimulationSetting.style.backgroundColor = "";
            SimulationSetting.style.color = "";
        }
    });
});

let LastTime = performance.now();
let FrameCount = 0;

function Loop() {
    ParticlesLabel.innerHTML = `Parts: ${Api.ParticleContainer.children.length}`;
    PerformanceLabel.innerHTML = `${String(Math.floor(Math.min(100, (parseInt(FpsLabel.textContent.replace("FPS:", "")) / 60)*100)))}%`;
    PerformanceLabel.style.color = `rgb(${255}, ${Math.round(Math.min(60, parseInt(PerformanceLabel.innerHTML)) / 60 * 255)}, ${Math.round(Math.min(60, parseInt(PerformanceLabel.innerHTML)) / 60 * 255)})`;

    const CurrentTime = performance.now();
    const ElapsedTime = CurrentTime - LastTime;

    if (ElapsedTime > 125) {
        const Fps = Math.floor(FrameCount / (ElapsedTime / 1200));
        FpsLabel.innerHTML = `FPS: ${Fps}`;
        LastTime = CurrentTime;
        FrameCount = 0;
    } else {
        FrameCount++;
    }

    requestAnimationFrame(Loop);
}

Loop();