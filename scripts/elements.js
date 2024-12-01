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
        Temp: 2400,
        Melt: 600
    },
    {
        Name: "MERC",
        Type: "Liquid",
        Color: "rgb(180, 180, 180)",
        Molten: "Liquid",
        Cold: "Liquid",
        Temp: 20,
        Melt: -39
    },
    {
        Name: "ACID",
        Type: "Liquid",
        Color: "rgb(255, 255, 155)",
        Molten: "Liquid",
        Cold: "Liquid",
        Temp: 22,
        Melt: 100,

        Acid: {
            Eating: [
                "METL",
                "STNE",
                "ZINC",
                "BROM",
                "IRON"
            ],

            Residue: ["HCL"],

            Speed: 500,
        }
    },
    {
        Name: "TNT",
        Type: "Explosive, Solid",
        Color: "rgb(255, 70, 70)",
        Molten: "Explosive, Solid",
        Cold: "Explosive, Solid",
        Temp: 22,
        Melt: 75,

        Explosive: {
            Charge: 20
        }
    },
    {
        Name: "NITR",
        Type: "Explosive, Liquid",
        Color: "rgb(50, 255, 50)",
        Molten: "Explosive, Liquid",
        Cold: "Explosive, Liquid",
        Temp: 22,
        Melt: 75,

        Explosive: {
            Charge: 15
        }
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
        Name: "TIN",
        Type: "Solid",
        Color: "rgb(90, 90, 90)",
        Molten: "Liquid",
        Cold: "Solid",
        Temp: 22,
        Melt: 400
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
        Name: "COAL",
        Type: "Solid",
        Color: "rgb(75, 75, 75)",
        Molten: "Solid",
        Cold: "Solid",
        Temp: 22,
        Flammable: [
            true,
            ["SMKE", "CO2"]
        ],
        Melt: Number.MAX_SAFE_INTEGER
    },
    {
        Name: "GOLD",
        Type: "Solid",
        Color: "rgb(200, 200, 100)",
        Molten: "Liquid",
        Cold: "Solid",
        Temp: 22,
        Melt: 900,
        Flammable: [
            true,
            ["SMKE", "CO2"]
        ]
    },
    {
        Name: "SULF",
        Type: "Solid",
        Color: "rgb(255, 255, 0)",
        Molten: "Liquid",
        Cold: "Solid",
        Temp: 22,
        Melt: 115
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
        Name: "ICE",
        Type: "Solid",
        Color: "rgb(200, 220, 255)",
        Molten: "Liquid",
        Cold: "Solid",
        Temp: -10,
        Melt: 0
    },
    {
        Name: "STNE",
        Type: "Powder",
        Color: "rgb(220, 220, 220)",
        Molten: "Liquid",
        Cold: "Powder",
        Temp: 22,
        Melt: 400
    },
    {
        Name: "SAND",
        Type: "Powder",
        Color: "rgb(220, 220, 180)",
        Molten: "Liquid",
        Cold: "Powder",
        Temp: 22,
        Melt: 700
    },
    {
        Name: "ROCK",
        Type: "Powder",
        Color: "rgb(80, 80, 80)",
        Molten: "Liquid",
        Cold: "Powder",
        Temp: 22,
        Melt: 500
    },
    {
        Name: "SNOW",
        Type: "Powder",
        Color: "rgb(200, 220, 255)",
        Molten: "Liquid",
        Cold: "Powder",
        Temp: -10,
        Melt: 0
    },
    {
        Name: "URAN",
        Type: "Radioactive, Powder",
        Color: "rgb(112, 112, 32)",
        Molten: "Liquid",
        Cold: "Powder",
        Temp: 22,
        Melt: 600,
        TMP: "50000000",
    },
    {
        Name: "PLUT",
        Type: "Radioactive, Powder",
        Color: "rgb(112, 150, 32)",
        Molten: "Liquid",
        Cold: "Powder",
        Temp: 22,
        Melt: 600,
        TMP: "500000",
    },
    {
        Name: "DEUT",
        Type: "Radioactive, Liquid",
        Color: "rgb(112, 112, 255)",
        Molten: "Liquid",
        Cold: "Liquid",
        Temp: 22,
        Melt: 0,
        TMP: "50000",
    },
    {
        Name: "FIRE",
        Type: "Gas",
        Color: "rgb(255, 50, 50)",
        Molten: "Gas",
        Cold: "Gas",
        Temp: 2200,
        Melt: 0,
        Incendiary: true,
        TMP: "500",
    },
    {
        Name: "CO2",
        Type: "Gas",
        Color: "rgb(70, 70, 70)",
        Molten: "Gas",
        Cold: "Gas",
        Temp: 22,
        Melt: 0,
        TMP: "500",
    },
    {
        Name: "SMKE",
        Type: "Gas",
        Color: "rgb(50, 50, 50)",
        Molten: "Gas",
        Cold: "Gas",
        Temp: 800,
        Melt: 0,
        TMP: "500",
    },
    {
        Name: "WTRV",
        Type: "Gas",
        Color: "rgb(100, 100, 200)",
        Molten: "Gas",
        Cold: "Liquid",
        Temp: 100,
        Melt: 95
    },
    {
        Name: "OXYG",
        Type: "Gas",
        Color: "rgb(100, 100, 200)",
        Molten: "Gas",
        Cold: "Gas",
        Temp: -183,
        Melt: 0
    },
    {
        Name: "PLSM",
        Type: "Gas",
        Color: "rgb(255, 100, 255)",
        Molten: "Gas",
        Cold: "Gas",
        Temp: 10000,
        Melt: 0,
        Incendiary: true,
        TMP: "500",
    },
    {
        Name: "TRIT",
        Type: "Radioactive, Gas",
        Color: "rgb(255, 230, 255)",
        Molten: "Gas",
        Cold: "Gas",
        Temp: 22,
        Melt: 0,
        TMP: "500",
    },
    {
        Name: "NEUT",
        Type: "Radioactive, Light",
        Color: "rgb(0, 200, 255)",
        TMP: "500",
    },
    {
        Name: "PROT",
        Type: "Radioactive, Light",
        Color: "rgb(255, 55, 0)",
        TMP: "500",
    },
    {
        Name: "PHOT",
        Type: "Radioactive, Light",
        Color: "rgb(255, 255, 255)",
        TMP: "500",
    },
    {
        Name: "NONE",
        Type: "None",
        Color: "rgb(255, 0, 0)"
    },
    {
        Name: "VOID",
        Type: "None",
        Color: "rgb(255, 75, 75)"
    },
    {
        Name: "PRTI",
        Type: "None",
        Color: "rgb(255, 155, 0)",
        Temp: 0,
        Loop: [true, true]
    },
    {
        Name: "PRTO",
        Type: "None",
        Color: "rgb(155, 155, 255)",
        Temp: 0,
        Loop: [false, true]
    },
    {
        Name: "CLNE",
        Type: "None",
        Color: "rgb(255, 255, 155)",
        Temp: 0,
        Clone: undefined
    }
];

export const Types = [
    [
        "Liquid",
        "../images/Liquid.svg"
    ],
    //[
    //    "Explosive",
    //    "../images/Explosive.svg"
    //],
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

export const PartStates = [
    "TMP"
];