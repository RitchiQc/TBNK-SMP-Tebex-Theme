import type { Metadata } from "next";
import { HomeHero } from "@/components/home/hero";
import { QuickLinks } from "@/components/home/quick-links";
import { Icon } from "@/components/ui/icons";
import { getDiscordStats } from "@/lib/community/discord";
import { getServerStatus } from "@/lib/community/server";
import { siteConfig } from "@/lib/site";
import { getStoreData } from "@/lib/tebex/store";

export const metadata: Metadata = {
  title: { absolute: "TBNK-SMP — Serveur Minecraft Java" },
  description: siteConfig.description,
  alternates: { canonical: "/" }
};

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const [{ packages }, serverStatus, discord, params] = await Promise.all([
    getStoreData(),
    getServerStatus(),
    getDiscordStats(),
    searchParams
  ]);

  return (
    <>
      {params.checkout === "success" ? (
        <div className="container-tbnk" style={{ paddingTop: 20 }}>
          <div className="cart-login-banner">
            <p>
              <b>Merci pour ton achat !</b> Ta commande a bien été transmise à
              Tebex. La livraison en jeu est automatique pour les articles
              éligibles.
            </p>
            <a
              href={siteConfig.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <Icon name="discord" size={14} />
              Support Discord
            </a>
          </div>
        </div>
      ) : null}

      <HomeHero serverStatus={serverStatus} />

      <QuickLinks
        discord={discord}
        serverStatus={serverStatus}
        packageCount={packages.length}
      />

    </>
  );
}
