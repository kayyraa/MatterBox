const NewElements = [
    {
        Type: "Solid",
        Name: "PLAS",
        Color: "rgb(155, 155, 155)",
        Temp: 22,
        Melt: 275,
        Molten: "Liquid",
        Cold: "Solid"
    },
    {
        Type: "Solid",
        Name: "WIRE",
        Color: "rgb(100, 100, 100)",
        Temp: 22,
        Melt: 300,
        Molten: "Liquid",
        Cold: "Solid"
    },
    {
        Type: "Liquid",
        Name: "EXOT",
        Color: "rgb(125, 125, 175)",
        Temp: 22,
        Melt: Number.MAX_SAFE_INTEGER,
        Molten: "Liquid",
        Cold: "Liquid"
    }
];

// Api is declared here
const Api = window.Api;

// Adds the elements in the "NewElements" array to the game
NewElements.forEach(NewElement => {
    Api.Siders.Add(NewElement);
});

// Removes the annoying text band on top of the screen (disabled by default)
// Api.Band.remove();

// Removes element called "PLAS"(Plastic) to the game (disabled by default)
// window.Api.Siders.Remove(PlasticElement.Name);