```js
const Mod = {
    Name: "My Mod",
    Version: "1.0",

    Init: () => {
        // runs once then never
    },

    Loop: () => {
        // runs once every frame
    }
};

import * as Api from "./scripts/api.js";
Api.Particle.GetPartFromPosition(201, 102).style.backgroundColor = "rgb(192, 81, 52)";
