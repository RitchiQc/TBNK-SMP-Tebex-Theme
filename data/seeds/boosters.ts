import { packageImages, type CategorySeed } from "./types";

export const boostersSeed: CategorySeed = {
  id: 4,
  name: "Boosters",
  slug: "boosters",
  description:
    "Accélère ta progression avec des multiplicateurs d'XP et de coins. Les boosters sont cumulables et s'activent instantanément.",
  imageUrl: packageImages.booster,
  displayType: "grid",
  order: 4,
  packages: [
    {
      id: 401,
      name: "Booster XP x2",
      slug: "booster-xp",
      description:
        "<p>Double ton XP pendant 1 heure.</p><ul><li>Multiplicateur x2</li><li>Durée : 1 heure</li><li>Cumulable</li></ul>",
      image: packageImages.booster,
      type: "single",
      basePrice: 3.49,
      order: 1
    },
    {
      id: 402,
      name: "Booster Coins x2",
      slug: "booster-coins",
      description:
        "<p>Double tes coins pendant 1 heure.</p><ul><li>Multiplicateur x2</li><li>Durée : 1 heure</li><li>Cumulable</li></ul>",
      image: packageImages.booster,
      type: "single",
      basePrice: 3.49,
      order: 2
    },
    {
      id: 403,
      name: "Pack Serveur x2",
      slug: "pack-serveur",
      description:
        "<p>Un boost partagé avec tous les joueurs connectés.</p><ul><li>XP et coins x2</li><li>Pour tout le serveur</li><li>Choisis la durée au moment de l'achat</li></ul>",
      image: packageImages.booster,
      type: "single",
      basePrice: 19.99,
      order: 3,
      variables: [
        {
          identifier: "duree",
          type: "dropdown",
          options: [
            { name: "1 heure", value: "1h" },
            { name: "6 heures", value: "6h" },
            { name: "24 heures", value: "24h" }
          ]
        }
      ]
    }
  ]
};
