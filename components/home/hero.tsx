import Link from "next/link";
import { siteConfig } from "@/lib/site";
import type { ServerStatus } from "@/lib/tebex/types";
import { CopyButton } from "@/components/ui/copy-button";
import { Icon } from "@/components/ui/icons";

export function HomeHero({ serverStatus }: { serverStatus: ServerStatus }) {
  const online = serverStatus.online;
  const statusLabel = online
    ? `${serverStatus.players.online}/${serverStatus.players.max} en ligne`
    : "En préparation";

  return (
    <section className="hero">
      <div className="hero__glow" aria-hidden="true" />
      <div className="container-tbnk hero__grid">
        <div className="hero__content">
          <span className="hero__eyebrow">
            <span
              className={`status-dot ${online ? "status-dot--online" : "status-dot--soon"}`}
            />
            Serveur Minecraft Java · {statusLabel}
          </span>

          <h1 className="hero__title">
            Bienvenue sur <em>TBNK-SMP</em>
          </h1>

          <p className="hero__text">
            Un serveur Minecraft Java pour jouer, progresser et soutenir la
            communauté. Découvre la boutique ou rejoins-nous sur Discord.
          </p>

          <div className="hero__actions">
            <Link href="/store" className="btn btn-primary btn-lg">
              <Icon name="store" size={18} />
              Découvrir la boutique
            </Link>
            <a
              href={siteConfig.discordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-lg"
            >
              <Icon name="discord" size={18} />
              Rejoindre le Discord
            </a>
          </div>

          <div className="hero__ip">
            <span className="hero__ip-label">IP Java</span>
            <code className="hero__ip-code">{siteConfig.javaIp}</code>
            <CopyButton
              value={siteConfig.javaIp}
              label="Copier"
              copiedLabel="Copié !"
              className="hero__copy"
            />
          </div>

        </div>

        <div className="hero__visual">
          <div className="hero__banner">
            <img
              src={siteConfig.banner}
              alt={`Bannière ${siteConfig.name}`}
              width={1024}
              height={1024}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
