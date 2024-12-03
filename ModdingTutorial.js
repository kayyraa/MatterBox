const PlasticElement = {
    Type: "Solid",
    Name: "PLAS",
    Color: "rgb(155, 155, 155)",
    Temp: 22,
    Melt: 275,
    Molten: "Liquid",
    Cold: "Solid"
}

// Adds element called "PLAS"(Plastic) to the game
window.Api.Siders.Add(PlasticElement);

// Removes element called "PLAS"(Plastic) to the game (disabled)
// window.Api.Siders.Remove(PlasticElement.Name);