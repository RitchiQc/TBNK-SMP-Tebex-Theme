import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="container-tbnk error-page">
      <div className="error-code">404</div>
      <h1>Cette page s’est perdue dans le Nether</h1>
      <p>
        La page que tu cherches n’existe pas ou a été déplacée. Retourne à
        l’accueil ou explore la boutique pour trouver ton prochain avantage.
      </p>
      <div className="error-actions">
        <Link href="/" className="btn btn-primary">
          <Icon name="home" size={16} />
          Retour à l’accueil
        </Link>
        <Link href="/store" className="btn btn-secondary">
          <Icon name="store" size={16} />
          Voir la boutique
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
