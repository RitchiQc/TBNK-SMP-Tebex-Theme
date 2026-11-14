import type { MetadataRoute } from "next";
import { isProduction } from "@/lib/deployment";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/"
      }
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/cart", "/login", "/api/"]
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.domain
  };
}
