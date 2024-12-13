import * as Api from "./api.js";

const Observer = new MutationObserver(() => {
    console.log(Api.ParticleContainer.children.length);
});

Observer.observe(Api.ParticleContainer, {
    childList: true,
});