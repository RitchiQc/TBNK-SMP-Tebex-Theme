import Link from "next/link";
import { siteConfig } from "@/lib/site";
import type { DiscordStats, ServerStatus } from "@/lib/tebex/types";
import { CopyButton } from "@/components/ui/copy-button";
import { Icon } from "@/components/ui/icons";

export function CommunitySection({
  discord,
  serverStatus,
  categoryCount,
  packageCount
}: {
  discord: DiscordStats;
  serverStatus: ServerStatus;
  categoryCount: number;
  packageCount: number;
}) {
  const online = serverStatus.online;

  return (
    <section className="container-tbnk home-section">
      <div className="home-section__head">
        <div>
          <span className="eyebrow">La communauté</span>
          <h2>Un serveur, une équipe, une aventure</h2>
          <p>
            Retrouve les annonces, les événements et les joueurs sur Discord.
            Tout le serveur avance ensemble.
          </p>
        </div>
      </div>

      <div className="community-grid">
        <div className="discord-card">
          <div className="discord-card__head">
            <span className="discord-card__icon">
              {discord.iconUrl ? (
                <img src={discord.iconUrl} alt="" width={46} height={46} />
              ) : (
                <Icon name="discord" size={24} />
              )}
            </span>
            <div>
              <div className="discord-card__title">Discord TBNK-SMP</div>
              <p className="discord-card__sub">
                Annonces, support, events et giveaways.
              </p>
            </div>
          </div>

          <div className="discord-card__stats">
            <div className="stat-box">
              <div className="stat-box__value">
                {discord.members.toLocaleString("fr-CA")}
              </div>
              <div className="stat-box__label">Membres</div>
            </div>
            <div className="stat-box">
              <div className="stat-box__value">
                {discord.online.toLocaleString("fr-CA")}
              </div>
              <div className="stat-box__label">En ligne</div>
            </div>
          </div>

          <a
            href={siteConfig.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            <Icon name="discord" size={17} />
            Rejoindre le Discord
            <Icon name="arrow-up-right" size={15} />
          </a>
        </div>

        <div className="status-card">
          <div className="status-card__head">
            <div>
              <div className="status-card__title">Statut du serveur</div>
              <p className="muted small" style={{ marginTop: 4 }}>
                {siteConfig.javaIp}
              </p>
            </div>
            <span className={`badge ${online ? "badge-success" : "badge-accent"}`}>
              <span className={`status-dot ${online ? "status-dot--online" : "status-dot--soon"}`} />
              {online ? "En ligne" : "En préparation"}
            </span>
          </div>

          <div className="status-list">
            <div className="status-list__row">
              <span>Joueurs</span>
              <strong>
                {online
                  ? `${serverStatus.players.online} / ${serverStatus.players.max}`
                  : "—"}
              </strong>
            </div>
            <div className="status-list__row">
              <span>Version</span>
              <strong>{serverStatus.version ?? "À venir"}</strong>
            </div>
            <div className="status-list__row">
              <span>Édition</span>
              <strong>Java</strong>
            </div>
            <div className="status-list__row">
              <span>Boutique</span>
              <strong>
                {categoryCount} catégories · {packageCount} articles
              </strong>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <CopyButton
              value={siteConfig.javaIp}
              label="Copier l’IP"
              className="btn btn-secondary btn-sm"
            />
            <Link href="/status" className="btn btn-secondary btn-sm">
              Voir le statut
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
