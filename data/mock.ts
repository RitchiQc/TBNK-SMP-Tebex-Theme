import { percentOff } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import type { Category, Package, Webstore } from "@/lib/tebex/types";
import { boostersSeed } from "./seeds/boosters";
import { cosmeticsSeed } from "./seeds/cosmetics";
import { keysSeed } from "./seeds/keys";
import { ranksSeed } from "./seeds/ranks";
import type { CategorySeed, PackageSeed } from "./seeds/types";

export const mockWebstore: Webstore = {
  name: siteConfig.name,
  description: siteConfig.description,
  logo: siteConfig.logo,
  currency: siteConfig.currency,
  lang: "fr",
  platformType: "Minecraft: Java Edition",
  supportsUsernames: true,
  supportsGifting: false,
  disabled: false
};

const categorySeeds: CategorySeed[] = [
  ranksSeed,
  keysSeed,
  cosmeticsSeed,
  boostersSeed
];

function seedPackage(
  category: CategorySeed,
  seed: PackageSeed,
  index: number
): Package {
  const basePrice = seed.basePrice;
  const totalPrice = seed.totalPrice ?? seed.basePrice;
  const discount = Math.max(0, basePrice - totalPrice);
  const media = [
    {
      type: "image" as const,
      url: seed.image,
      name: null,
      primary: true,
      featured: Boolean(seed.featured)
    }
  ];

  return {
    id: seed.id,
    ident: `pkg_${category.id}_${seed.id}`,
    name: seed.name,
    slug: seed.slug,
    description: seed.description,
    image: seed.image,
    media,
    type: seed.type,
    basePrice,
    discount,
    totalPrice,
    currency: siteConfig.currency,
    expirationDate: null,
    billingPeriod: seed.billingPeriod ?? null,
    categoryId: category.id,
    categoryName: category.name,
    categorySlug: category.slug,
    variables: seed.variables ?? [],
    disableQuantity:
      seed.disableQuantity ?? seed.type === "subscription",
    disableGifting: false,
    order: seed.order ?? index + 1,
    featured: Boolean(seed.featured),
    popular: (siteConfig.popularPackages as readonly string[]).includes(
      seed.slug
    ),
    discountPercent: percentOff(basePrice, totalPrice)
  };
}

export const mockCategories: Category[] = categorySeeds.map((category) => ({
  id: category.id,
  name: category.name,
  slug: category.slug,
  description: category.description,
  imageUrl: category.imageUrl,
  displayType: category.displayType,
  order: category.order,
  tiered: false,
  packages: category.packages.map((seed, index) =>
    seedPackage(category, seed, index)
  )
}));

export const mockPackages: Package[] = mockCategories.flatMap(
  (category) => category.packages
);
