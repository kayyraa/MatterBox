import * as Api from "./api.js";

const StorageSystem = () => {
    return; // Not available for production
    const Storage = new Api.Storage();
    Storage.Storage.StorageSize = 255;
    Storage.Storage.StorageName = "PartStorage";
    Storage.Storage.StorageId = "PartStorage";
    if (!localStorage.getItem("PartStorage")) Storage.Append();
    else {
        const StorageItems = Array.from(JSON.parse(localStorage.getItem("PartStorage")).StorageItems);
        StorageItems.forEach(Particle => {
            Particle = JSON.parse(Particle);
            const Part = Api.Particle.GeneratePart({
                X: Particle.Pos[0],
                Y: Particle.Pos[1],
                Snapped: true,
            }, Api.Particle.GetElement(Particle.Name));
        });
    }
    window.Storage = Storage;

    var FrameCount = 0;
    function Loop() {
        FrameCount++;
        if (FrameCount > 5000) {
            Array.from(Api.ParticleContainer.children).forEach(Particle => {
                if (!Particle.hasAttribute("Pos")) return;
                const Position = Object.values(JSON.parse(Particle.getAttribute("Pos")));
                const Name = String(Particle.getAttribute("Name").replace(/['"]/g, ""));
                const Temp = parseInt(Particle.getAttribute("Temp"));
                const TMP = Particle.hasAttribute("TMP") ? parseInt(Particle.getAttribute("TMP")) : undefined;
            
                const ParticleObject = {
                    Name: Name,
                    Pos: Position,
                    Temp: Temp,
                };
            
                if (TMP) ParticleObject["TMP"] = TMP;
                const ExistingItem = Storage.GetItems().find(Item => JSON.stringify(Item.Pos) === JSON.stringify(Position));
                if (ExistingItem) Storage.UpdateItem(ExistingItem, ParticleObject);
                else Storage.AddItem(JSON.stringify(ParticleObject));
            });
        }
        requestAnimationFrame(Loop);
    }

    Loop();
};

StorageSystem();