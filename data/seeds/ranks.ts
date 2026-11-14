import { packageImages, type CategorySeed } from "./types";

export const ranksSeed: CategorySeed = {
  id: 1,
  name: "Rangs",
  slug: "rangs",
  description:
    "Des avantages permanents pour profiter pleinement de TBNK-SMP : homes supplémentaires, commandes exclusives, priorité et bonus économiques.",
  imageUrl: packageImages.rank,
  displayType: "grid",
  order: 1,
  packages: [
    {
      id: 101,
      name: "TBNK+",
      slug: "tbnk-plus",
      description:
        "<p>Le rang idéal pour commencer ton aventure avec confort et style.</p><ul><li>3 homes supplémentaires</li><li>/fly dans le spawn</li><li>File d'attente prioritaire</li><li>+25 % de coins</li><li>Badge TBNK+ dans le chat</li></ul>",
      image: packageImages.rank,
      type: "subscription",
      basePrice: 9.99,
      featured: true,
      order: 1
    },
    {
      id: 102,
      name: "TBNK++",
      slug: "tbnk-plus-plus",
      description:
        "<p>Plus de liberté, plus de commandes, plus de style.</p><ul><li>6 homes supplémentaires</li><li>/fly partout</li><li>/nick et /hat</li><li>+50 % de coins</li><li>Cosmétique exclusif TBNK++</li></ul>",
      image: packageImages.rank,
      type: "subscription",
      basePrice: 19.99,
      order: 2
    },
    {
      id: 103,
      name: "TBNK Légende",
      slug: "tbnk-legende",
      description:
        "<p>Le rang ultime pour ceux qui veulent marquer l'histoire du serveur.</p><ul><li>10 homes supplémentaires</li><li>/fly et /nick partout</li><li>+100 % de coins</li><li>Accès aux bêtas</li><li>Particule légendaire</li></ul>",
      image: packageImages.rank,
      type: "subscription",
      basePrice: 34.99,
      order: 3
    }
  ]
};
