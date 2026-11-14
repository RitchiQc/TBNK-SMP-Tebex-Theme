import type { PackageType, PackageVariable } from "@/lib/tebex/types";

export type PackageSeed = {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  type: PackageType;
  basePrice: number;
  totalPrice?: number;
  billingPeriod?: string;
  disableQuantity?: boolean;
  featured?: boolean;
  order?: number;
  variables?: PackageVariable[];
};

export type CategorySeed = {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  displayType: "grid" | "list";
  order: number;
  packages: PackageSeed[];
};

export const packageImages = {
  rank: "/images/packages/rank.svg",
  key: "/images/packages/key.svg",
  cosmetic: "/images/packages/cosmetic.svg",
  booster: "/images/packages/booster.svg",
  placeholder: "/images/package-placeholder.svg"
} as const;
