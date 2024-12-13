const Elements = [
    {
        Name: "HCl",
        NoColor: true
    },
    {
        Name: "H2SO4",
        NoColor: true
    },
    {
        Name: "CH3COOH",
        NoColor: true
    },
    {
        Name: "HNO3",
        NoColor: true
    },
    {
        Name: "C6H8O7",
        NoColor: true
    },
    {
        Name: "H2PO4",
        NoColor: true
    },
    {
        Name: "H2CO3",
        NoColor: true
    },
    {
        Name: "HF",
        NoColor: true
    },
    {
        Name: "HClO4",
        NoColor: true
    }
];

const Api = window.Api;

Elements.forEach(Element => {
    if (Element.NoColor) {
        Element.Color = "rgb(225, 225, 225)";
        Element.Temp = 22;
        Element.Melt = Math.floor(Math.random() * 11) + 90
        Element.Type = "Liquid";
        Element.Cold = "Liquid";
        Element.Molten = "Gas";
        Api.Siders.Add(Element);
    }
});