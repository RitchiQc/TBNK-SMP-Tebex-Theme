const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const siteConfig = {
  name: "TBNK-SMP",
  shortName: "TBNK",
  tagline: "Serveur Minecraft Java",
  description:
    "Boutique officielle du serveur Minecraft Java TBNK-SMP. Rangs, clés, cosmétiques et boosters — livraison instantanée via Tebex.",
  url: rawSiteUrl,
  domain: "tbnk-smp.com",
  locale: "fr-CA",
  language: "fr",
  currency: "CAD",
  javaIp: "play.tbnk-smp.com",
  bedrockEnabled: false,
  discordUrl: "https://discord.gg/td98WkM7V5",
  discordInviteCode: "td98WkM7V5",
  discordGuildId: "1566593760870277241",
  discordFallbackMembers: 94,
  discordFallbackOnline: 35,
  supportEmail: "",
  logo: "/images/logo.png",
  banner: "/images/banner.png",
  favicon: "/icon.svg",
  accent: "#F7941D",
  accentDeep: "#E86E1D",
  accentLight: "#FFB347",
  background: "#0E0E0E",
  /** Slugs des packages à mettre en avant avec le badge « Populaire ». */
  popularPackages: ["tbnk-plus", "cle-prime"],
  navigation: [
    { label: "Accueil", href: "/" },
    { label: "Boutique", href: "/store" },
    { label: "Statut", href: "/status" },
    { label: "Guide", href: "/guide" }
  ]
} as const;

export type SiteConfig = typeof siteConfig;
