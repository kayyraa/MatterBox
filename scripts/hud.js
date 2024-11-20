import { Elements, Types } from "./elements.js";
import * as Api from "./api.js";

const TypeList = document.querySelector(".TypeList");
const SimulationSetsList = document.querySelector(".SimulationSettingsList");
const Selector = document.querySelector(".Selector");

const FpsLabel = document.querySelector(".FpsLabel");
const PerformanceLabel = document.querySelector(".PerformanceLabel");
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
    TypeNameElement.innerHTML = TypeName.replace("None", "Special");
    TypeElement.appendChild(TypeNameElement);

    TypeElement.addEventListener("click", () => {
        Selector.querySelector(`.${TypeName}`).style.display = "flex";
        Selector.querySelector(`.${TypeName}`).style.opacity = "1";
        TypeElement.style.backgroundColor = "white";
        TypeElement.querySelector("img").style.filter = "invert(100%) brightness(0%)";

        Array.from(Selector.children).forEach(OtherSelector => {
            if (!OtherSelector.classList.contains(TypeName)) {
                OtherSelector.style.opacity = "0";
                setTimeout(() => {
                    OtherSelector.style.display = "";
                }, 250);
            }
        })

        Array.from(TypeList.children).forEach(OtherType => {
            if (OtherType !== TypeElement) {
                OtherType.style.backgroundColor = "";
                OtherType.querySelector("img").style.filter = "";
            }
        });
    });
});

Array.from(SimulationSetsList.children).forEach(SimulationSetting => {
    SimulationSetting.dataset.Enabled = "false";

    SimulationSetting.addEventListener("click", () => {
        SimulationSetting.dataset.Enabled = SimulationSetting.dataset.Enabled === "true" ? "false" : "true";

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
    PerformanceLabel.style.color = parseInt(PerformanceLabel.innerHTML.replace("%", "")) < 25 ? "red" : parseInt(PerformanceLabel.innerHTML.replace("%", "")) < 75 ? "orange" : "white";

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

    if (window.Performance.ReduceLight) {
        Array.from(Api.ParticleContainer.children).forEach(Light => {
            if (Light.dataset.Type.includes("Light")) {
                Light.remove();
            }
        });
    }

    requestAnimationFrame(Loop);
}

Loop();