import { packageImages, type CategorySeed } from "./types";

export const cosmeticsSeed: CategorySeed = {
  id: 3,
  name: "Cosmétiques",
  slug: "cosmetiques",
  description:
    "Démarque-toi avec des capes, auras et montures exclusives. Les cosmétiques sont purement visuels et ne donnent aucun avantage en jeu.",
  imageUrl: packageImages.cosmetic,
  displayType: "grid",
  order: 3,
  packages: [
    {
      id: 301,
      name: "Cape TBNK",
      slug: "cape-tbnk",
      description:
        "<p>La cape officielle du serveur, aux couleurs de TBNK-SMP.</p><ul><li>Cape exclusive</li><li>Compatible Java</li><li>Activation immédiate</li></ul>",
      image: packageImages.cosmetic,
      type: "single",
      basePrice: 6.99,
      order: 1
    },
    {
      id: 302,
      name: "Aura de feu",
      slug: "aura-de-feu",
      description:
        "<p>Une aura enflammée qui suit chacun de tes pas.</p><ul><li>Effet de particules</li><li>Durée illimitée</li><li>Activation immédiate</li></ul>",
      image: packageImages.cosmetic,
      type: "single",
      basePrice: 8.99,
      order: 2
    },
    {
      id: 303,
      name: "Monture squelette",
      slug: "monture-squelette",
      description:
        "<p>Une monture rare pour traverser le monde avec style.</p><ul><li>Monture exclusive</li><li>Apparence personnalisée</li><li>Activation immédiate</li></ul>",
      image: packageImages.cosmetic,
      type: "single",
      basePrice: 12.99,
      order: 3
    }
  ]
};
