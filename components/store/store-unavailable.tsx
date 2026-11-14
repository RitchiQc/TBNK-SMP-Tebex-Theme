import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { Icon } from "@/components/ui/icons";

export function StoreUnavailable({
  title = "Boutique temporairement indisponible",
  message = "Le catalogue Tebex ne répond pas pour le moment. Réessaie dans un instant ou rejoins le Discord pour être informé."
}: {
  title?: string;
  message?: string;
}) {
  return (
    <section className="container-tbnk section">
      <div className="empty-state">
        <span className="empty-state__icon">
          <Icon name="package" size={24} />
        </span>
        <h2>{title}</h2>
        <p>{message}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/" className="btn btn-secondary btn-sm">
            <Icon name="home" size={15} />
            Accueil
          </Link>
          <a
            href={siteConfig.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            <Icon name="discord" size={15} />
            Rejoindre le Discord
          </a>
        </div>
      </div>
    </section>
  );
}
