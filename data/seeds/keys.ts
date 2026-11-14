import { packageImages, type CategorySeed } from "./types";

export const keysSeed: CategorySeed = {
  id: 2,
  name: "Clés & Coffres",
  slug: "cles-coffres",
  description:
    "Ouvre des coffres remplis de récompenses : équipements, coins, cosmétiques et objets rares. Livraison instantanée en jeu.",
  imageUrl: packageImages.key,
  displayType: "grid",
  order: 2,
  packages: [
    {
      id: 201,
      name: "Clé Prime",
      slug: "cle-prime",
      description:
        "<p>La clé d'entrée pour commencer à collectionner les récompenses du serveur.</p><ul><li>1 objet rare garanti</li><li>Coins et XP</li><li>Chance de cosmétique</li></ul>",
      image: packageImages.key,
      type: "single",
      basePrice: 4.49,
      featured: true,
      order: 1
    },
    {
      id: 202,
      name: "Clé Améthyste",
      slug: "cle-amethyste",
      description:
        "<p>Une clé premium avec un meilleur taux de rareté.</p><ul><li>2 objets rares garantis</li><li>Chance élevée de cosmétique</li><li>Bonus de coins</li></ul>",
      image: packageImages.key,
      type: "single",
      basePrice: 8.99,
      totalPrice: 7.19,
      order: 2
    },
    {
      id: 203,
      name: "Clé Or",
      slug: "cle-or",
      description:
        "<p>Le coffre doré des joueurs réguliers.</p><ul><li>3 objets rares</li><li>Chance de monture</li><li>Coins doublés</li></ul>",
      image: packageImages.key,
      type: "single",
      basePrice: 5.99,
      order: 3
    },
    {
      id: 204,
      name: "Coffre Ultime",
      slug: "coffre-ultime",
      description:
        "<p>Le pack complet pour les collectionneurs : cinq clés et un cosmétique garanti.</p><ul><li>5 clés de ton choix</li><li>1 cosmétique garanti</li><li>Bonus de coins</li></ul>",
      image: packageImages.key,
      type: "single",
      basePrice: 14.99,
      featured: true,
      order: 4
    }
  ]
};
