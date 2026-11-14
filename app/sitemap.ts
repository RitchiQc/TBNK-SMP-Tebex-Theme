import type { MetadataRoute } from "next";
import { LEGAL_LINKS } from "@/lib/legal";
import { siteConfig } from "@/lib/site";
import { getStoreData } from "@/lib/tebex/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1
    },
    {
      url: `${siteConfig.url}/store`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${siteConfig.url}/status`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.6
    },
    {
      url: `${siteConfig.url}/guide`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5
    },
    ...LEGAL_LINKS.map((link) => ({
      url: `${siteConfig.url}/legal/${link.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3
    }))
  ];

  try {
    const { categories, packages } = await getStoreData();
    return [
      ...staticRoutes,
      ...categories.map((category) => ({
        url: `${siteConfig.url}/store/${category.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8
      })),
      ...packages.map((pkg) => ({
        url: `${siteConfig.url}/package/${pkg.slug}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.7
      }))
    ];
  } catch {
    return staticRoutes;
  }
}
