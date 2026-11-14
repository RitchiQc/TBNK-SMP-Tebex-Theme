"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[storefront] route error", error);
  }, [error]);

  return (
    <div className="container-tbnk error-page">
      <div className="error-code">Oups</div>
      <h1>Une erreur est survenue</h1>
      <p>
        Impossible de charger cette page pour le moment. Réessaie dans un
        instant. Si le problème persiste, contacte-nous sur Discord.
      </p>
      <div className="error-actions">
        <button type="button" className="btn btn-primary" onClick={reset}>
          <Icon name="refresh" size={16} />
          Réessayer
        </button>
        <Link href="/" className="btn btn-secondary">
          <Icon name="home" size={16} />
          Accueil
        </Link>
        <a
          href={siteConfig.discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
        >
          <Icon name="discord" size={16} />
          Discord
        </a>
      </div>
    </div>
  );
}
