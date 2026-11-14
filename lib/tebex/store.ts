import "server-only";

import { cache } from "react";
import { mockCategories, mockPackages, mockWebstore } from "@/data/mock";
import { siteConfig } from "@/lib/site";
import {
  getCategoriesRaw,
  getWebstoreRaw,
  isMockMode
} from "./client";
import { mapCategory, mapWebstore } from "./mapper";
import type {
  Category,
  Package,
  StoreData,
  Webstore
} from "./types";

const FALLBACK_WEBSTORE: Webstore = {
  name: siteConfig.name,
  description: siteConfig.description,
  logo: null,
  currency: siteConfig.currency,
  lang: "fr",
  platformType: "Minecraft: Java Edition",
  supportsUsernames: true,
  supportsGifting: false,
  disabled: false
};

export type SafeStoreData = StoreData & { unavailable: boolean };

function unwrapData(raw: unknown): unknown {
  if (
    raw &&
    typeof raw === "object" &&
    "data" in raw &&
    (raw as Record<string, unknown>).data !== undefined
  ) {
    return (raw as Record<string, unknown>).data;
  }
  return raw;
}

function decodeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function sortCategories(categories: Category[]): Category[] {
  return categories
    .map((category, index) => ({ category, index }))
    .sort(
      (a, b) =>
        (a.category.order || a.index) - (b.category.order || b.index)
    )
    .map(({ category }) => ({
      ...category,
      packages: category.packages
        .map((pkg, index) => ({ pkg, index }))
        .sort((a, b) => (a.pkg.order || a.index) - (b.pkg.order || b.index))
        .map(({ pkg }) => ({
          ...pkg,
          popular: (siteConfig.popularPackages as readonly string[]).includes(
            pkg.slug
          )
        }))
    }));
}

export const getWebstore = cache(async (): Promise<Webstore> => {
  if (isMockMode) return mockWebstore;

  const raw = await getWebstoreRaw();
  if (!raw) {
    throw new Error("Impossible de charger les informations de la boutique Tebex.");
  }
  const webstore = mapWebstore(unwrapData(raw));
  if (webstore.disabled) {
    throw new Error("La boutique Tebex est désactivée.");
  }
  return webstore;
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (isMockMode) return mockCategories;

  const raw = await getCategoriesRaw();
  const record =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  const data = record && Array.isArray(record.data) ? record.data : null;

  if (!data) {
    throw new Error("Impossible de charger les catégories de la boutique Tebex.");
  }

  return sortCategories(data.map(mapCategory));
});

export const getStoreData = cache(async (): Promise<StoreData> => {
  if (isMockMode) {
    return {
      webstore: mockWebstore,
      categories: mockCategories,
      packages: mockPackages,
      isMock: true
    };
  }

  const [webstore, categories] = await Promise.all([
    getWebstore(),
    getCategories()
  ]);

  return {
    webstore,
    categories,
    packages: categories.flatMap((category) => category.packages),
    isMock: false
  };
});

/**
 * Version tolérante aux pannes de Tebex, utilisée par le layout global.
 * Une panne du catalogue ne doit pas empêcher d'afficher les pages légales,
 * le guide ou le statut du serveur.
 */
export const getStoreDataSafe = cache(async (): Promise<SafeStoreData> => {
  try {
    const data = await getStoreData();
    return { ...data, unavailable: false };
  } catch (error) {
    console.error("[tebex] storefront unavailable", error);
    return {
      webstore: FALLBACK_WEBSTORE,
      categories: [],
      packages: [],
      isMock: false,
      unavailable: true
    };
  }
});

export const getAllPackages = cache(async (): Promise<Package[]> => {
  const { packages } = await getStoreData();
  return packages;
});

export const getFeaturedPackages = cache(
  async (limit = 3): Promise<Package[]> => {
    const { packages } = await getStoreData();
    return packages
      .filter((pkg) => pkg.featured)
      .slice(0, limit);
  }
);

export const getCategoryBySlug = cache(
  async (slug: string): Promise<Category | null> => {
    const key = decodeSlug(slug);
    const { categories } = await getStoreData();
    return (
      categories.find(
        (category) =>
          category.slug === key || String(category.id) === key
      ) ?? null
    );
  }
);

export const getPackageBySlug = cache(
  async (
    slug: string
  ): Promise<{ pkg: Package; category: Category } | null> => {
    const key = decodeSlug(slug);
    const { categories } = await getStoreData();

    for (const category of categories) {
      const pkg = category.packages.find(
        (item) =>
          item.slug === key ||
          item.ident === key ||
          String(item.id) === key
      );
      if (pkg) return { pkg, category };
    }

    return null;
  }
);

export const getPackageById = cache(
  async (id: number): Promise<Package | null> => {
    const { packages } = await getStoreData();
    return packages.find((pkg) => pkg.id === id) ?? null;
  }
);

/**
 * Retrouve un package par identifiant Tebex (`ident`), slug ou ID numérique.
 * L'API recommande `ident` pour tous les types de packages, notamment les
 * packages external/dynamic.
 */
export const getPackageByIdent = cache(
  async (identifier: string): Promise<Package | null> => {
    const key = identifier.trim();
    if (!key) return null;

    const { packages } = await getStoreData();
    return (
      packages.find(
        (pkg) =>
          pkg.ident === key ||
          pkg.slug === key ||
          String(pkg.id) === key
      ) ?? null
    );
  }
);
