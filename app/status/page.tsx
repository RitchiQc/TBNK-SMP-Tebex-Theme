import type { Metadata } from "next";
import Link from "next/link";
import { CopyButton } from "@/components/ui/copy-button";
import { Icon } from "@/components/ui/icons";
import { getDiscordStats } from "@/lib/community/discord";
import { getServerStatus } from "@/lib/community/server";
import { siteConfig } from "@/lib/site";
import { getStoreData } from "@/lib/tebex/store";

export const metadata: Metadata = {
  title: "Statut du serveur",
  description:
    "Statut en direct du serveur Minecraft Java TBNK-SMP : joueurs en ligne, version, Discord et informations de connexion.",
  alternates: { canonical: "/status" }
};

export default async function StatusPage() {
  const [serverStatus, discord, { categories, packages }] = await Promise.all([
    getServerStatus(),
    getDiscordStats(),
    getStoreData()
  ]);

  const online = serverStatus.online;

  return (
    <>
      <div className="container-tbnk" style={{ paddingTop: 34 }}>
        <div className="status-hero">
          <div>
            <span className="eyebrow">Statut en direct</span>
            <h1>Le serveur, en temps réel</h1>
            <p>
              État de TBNK-SMP, joueurs connectés, version et informations de
              connexion. Le statut est mis à jour automatiquement toutes les
              minutes.
            </p>
            <div className="page-hero__meta" style={{ marginTop: 16 }}>
              <span className={`badge ${online ? "badge-success" : "badge-accent"}`}>
                <span className={`status-dot ${online ? "status-dot--online" : "status-dot--soon"}`} />
                {online ? "En ligne" : "En préparation"}
              </span>
              <span className="badge badge-muted">Java Edition</span>
              <span className="badge badge-muted">play.tbnk-smp.com</span>
            </div>
          </div>

          <div className="status-hero__panel">
            <span className="join-ip-card__label">IP Java</span>
            <div className="status-hero__ip">
              <code>{siteConfig.javaIp}</code>
              <CopyButton
                value={siteConfig.javaIp}
                label="Copier"
                className="btn btn-primary btn-sm"
              />
            </div>
            <div className="divider" style={{ margin: "10px 0" }} />
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
              <strong>Java uniquement</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="container-tbnk home-section">
        <div className="status-page-grid status-page-grid--3">
          <div className="status-card">
            <div className="status-card__head">
              <div className="status-card__title">Serveur Minecraft</div>
              <Icon name="server" size={22} />
            </div>
            <div className="status-card__value">
              {online ? `${serverStatus.players.online}` : "—"}
            </div>
            <p className="muted small">
              {online ? "joueurs connectés" : "ouverture prochaine"}
            </p>
            <div className="status-list">
              <div className="status-list__row">
                <span>Capacité</span>
                <strong>{online ? serverStatus.players.max : "—"}</strong>
              </div>
              <div className="status-list__row">
                <span>MOTD</span>
                <strong>{serverStatus.motd ?? "TBNK-SMP"}</strong>
              </div>
              <div className="status-list__row">
                <span>Connexion</span>
                <strong>{siteConfig.javaIp}</strong>
              </div>
            </div>
            <Link href="/guide" className="btn btn-secondary btn-sm">
              <Icon name="gamepad" size={14} />
              Comment rejoindre
            </Link>
          </div>

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
                  Annonces et support de la communauté.
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
              <Icon name="discord" size={16} />
              Rejoindre le Discord
            </a>
          </div>

          <div className="status-card">
            <div className="status-card__head">
              <div className="status-card__title">Boutique</div>
              <Icon name="store" size={22} />
            </div>
            <div className="status-card__value">{packages.length}</div>
            <p className="muted small">articles disponibles</p>
            <div className="status-list">
              <div className="status-list__row">
                <span>Catégories</span>
                <strong>{categories.length}</strong>
              </div>
              <div className="status-list__row">
                <span>Paiement</span>
                <strong>Tebex</strong>
              </div>
              <div className="status-list__row">
                <span>Devise</span>
                <strong>CAD</strong>
              </div>
              <div className="status-list__row">
                <span>Livraison</span>
                <strong>Automatique</strong>
              </div>
            </div>
            <Link href="/store" className="btn btn-secondary btn-sm">
              <Icon name="store" size={14} />
              Voir la boutique
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
