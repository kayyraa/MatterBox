export const Elements = [
    {
        Name: "WATR",
        Type: "Liquid",
        Color: "rgb(75, 75, 200)",
        Molten: "Gas",
        Cold: "Liquid",
        Temp: 22,
        Melt: 100
    },
    {
        Name: "LAVA",
        Type: "Liquid",
        Color: "rgb(255, 0, 0)",
        Molten: "Liquid",
        Cold: "Solid",
        Temp: 1600,
        Melt: 800
    },
    {
        Name: "MGMA",
        Type: "Solid",
        Color: "rgb(255, 150, 50)",
        Molten: "Liquid",
        Cold: "Solid",
        Temp: 1200,
        Melt: 1200
    },
    {
        Name: "IRON",
        Type: "Solid",
        Color: "rgb(100, 100, 100)",
        Molten: "Liquid",
        Cold: "Solid",
        Temp: 22,
        Melt: 1500
    },
    {
        Name: "TTAN",
        Type: "Solid",
        Color: "rgb(120, 120, 120)",
        Molten: "Liquid",
        Cold: "Solid",
        Temp: 22,
        Melt: 1800
    },
    {
        Name: "GLAS",
        Type: "Solid",
        Color: "rgb(90, 90, 90)",
        Molten: "Liquid",
        Cold: "Solid",
        Temp: 22,
        Melt: 1600
    },
    {
        Name: "GOLD",
        Type: "Solid",
        Color: "rgb(200, 200, 100)",
        Molten: "Liquid",
        Cold: "Solid",
        Temp: 22,
        Melt: 900
    },
    {
        Name: "DMND",
        Type: "Solid",
        Color: "rgb(55, 200, 200)",
        Molten: "Liquid",
        Cold: "Solid",
        Temp: 22,
        Melt: 3200
    },
    {
        Name: "STNE",
        Type: "Powder",
        Color: "rgb(220, 220, 220)",
        Molten: "Liquid",
        Cold: "Powder",
        Temp: 22,
        Melt: 400,

        Physics: {
            Density: 2.4,
            Elasticity: 0.2
        }
    },
    {
        Name: "SAND",
        Type: "Powder",
        Color: "rgb(220, 220, 180)",
        Molten: "Liquid",
        Cold: "Powder",
        Temp: 22,
        Melt: 700,

        Physics: {
            Density: 3,
            Elasticity: 0
        }
    },
    {
        Name: "ROCK",
        Type: "Powder",
        Color: "rgb(80, 80, 80)",
        Molten: "Liquid",
        Cold: "Powder",
        Temp: 22,
        Melt: 500,

        Physics: {
            Density: 6,
            Elasticity: 0
        }
    },
    {
        Name: "URAN",
        Type: "Radioactive, Powder",
        Color: "rgb(112, 112, 32)",
        Molten: "Liquid",
        Cold: "Powder",
        Temp: 22,
        Pres: 5,
        Melt: 600
    },
    {
        Name: "PLUT",
        Type: "Radioactive, Powder",
        Color: "rgb(112, 150, 32)",
        Molten: "Liquid",
        Cold: "Powder",
        Temp: 22,
        Pres: 5,
        Melt: 600
    },
    {
        Name: "DEUT",
        Type: "Radioactive, Liquid",
        Color: "rgb(112, 112, 255)",
        Molten: "Liquid",
        Cold: "Liquid",
        Temp: 22,
        Pres: 0,
        Melt: 0
    },
    {
        Name: "WTRV",
        Type: "Gas",
        Color: "rgb(100, 100, 200)",
        Molten: "Gas",
        Cold: "Liquid",
        Temp: 100,
        Pres: 2,
        Melt: 95
    },
    {
        Name: "FIRE",
        Type: "Gas",
        Color: "rgb(255, 50, 50)",
        Molten: "Gas",
        Cold: "Gas",
        Temp: 2200,
        Pres: 4,
        Melt: 0
    },
    {
        Name: "NEUT",
        Type: "Radioactive, Light",
        Color: "rgb(0, 200, 255)"
    },
    {
        Name: "PROT",
        Type: "Radioactive, Light",
        Color: "rgb(255, 55, 0)"
    },
    {
        Name: "PHOT",
        Type: "Radioactive, Light",
        Color: "rgb(255, 255, 255)"
    },
    {
        Name: "NONE",
        Type: "None",
        Color: "rgb(255, 0, 0)"
    }
];

export const Types = [
    [
        "Liquid",
        "../images/Liquid.svg"
    ],
    [
        "Solid",
        "../images/Solid.svg"
    ],
    [
        "Powder",
        "../images/Powder.svg"
    ],
    [
        "Gas",
        "../images/Gas.svg"
    ],
    [
        "Radioactive",
        "../images/Radioactive.svg"
    ],
    [
        "None",
        "../images/None.svg"
    ],
];