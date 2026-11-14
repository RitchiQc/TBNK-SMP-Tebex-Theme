import type { Metadata } from "next";
import { HomeHero } from "@/components/home/hero";
import { QuickLinks } from "@/components/home/quick-links";
import { Icon } from "@/components/ui/icons";
import { getDiscordStats } from "@/lib/community/discord";
import { getServerStatus } from "@/lib/community/server";
import { siteConfig } from "@/lib/site";
import { getStoreDataSafe } from "@/lib/tebex/store";

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
  const [{ packages, unavailable }, serverStatus, discord, params] =
    await Promise.all([
      getStoreDataSafe(),
      getServerStatus(),
      getDiscordStats(),
      searchParams
    ]);

  return (
    <>
      {params.checkout === "success" ? (
        <div className="container-tbnk" style={{ paddingTop: 20 }}>
          <div className="cart-login-banner" role="status">
            <p>
              <b>Retour de Tebex.</b> Si ton paiement a été confirmé, ta
              commande a été transmise à Tebex et la livraison en jeu est
              automatique pour les articles éligibles. Consulte ton reçu Tebex
              pour la confirmation officielle.
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

      {unavailable ? (
        <div className="container-tbnk" style={{ paddingTop: 20 }}>
          <div className="cart-login-banner" role="status">
            <p>
              <b>Boutique temporairement indisponible.</b> Le catalogue Tebex ne
              répond pas pour le moment. Le serveur, le guide et les pages
              légales restent accessibles.
            </p>
            <a
              href={siteConfig.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <Icon name="discord" size={14} /> Support Discord
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
