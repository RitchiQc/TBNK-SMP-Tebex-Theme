import { siteConfig } from "@/lib/site";
import { CopyButton } from "@/components/ui/copy-button";
import { Icon } from "@/components/ui/icons";

export function JoinSection() {
  return (
    <section className="container-tbnk home-section" id="rejoindre">
      <div className="join-grid">
        <div className="join-card">
          <span className="icon-tile">
            <Icon name="gamepad" size={22} />
          </span>
          <h3 style={{ marginTop: 14 }}>Java uniquement</h3>
          <p>Trois étapes suffisent pour nous rejoindre.</p>

          <div className="join-steps">
            <div className="join-step">
              <span className="join-step__number">1</span>
              <div>
                <b>Lance Minecraft Java Edition</b>
                <span>Utilise la version compatible avec le serveur.</span>
              </div>
            </div>
            <div className="join-step">
              <span className="join-step__number">2</span>
              <div>
                <b>Ajoute le serveur</b>
                <span>
                  Multijoueur → Ajouter un serveur → colle l’IP ci-contre.
                </span>
              </div>
            </div>
            <div className="join-step">
              <span className="join-step__number">3</span>
              <div>
                <b>Rejoins la communauté</b>
                <span>
                  Passe sur le Discord pour les annonces, les événements et
                  l’entraide.
                </span>
              </div>
            </div>
          </div>

          <a
            href={siteConfig.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-wide"
            style={{ marginTop: 20 }}
          >
            <Icon name="discord" size={17} />
            Ouvrir le Discord
          </a>
        </div>

        <div className="join-ip-card">
          <span className="join-ip-card__label">Adresse du serveur</span>
          <div className="join-ip-card__ip">
            <code>{siteConfig.javaIp}</code>
            <CopyButton
              value={siteConfig.javaIp}
              label="Copier l’IP"
              copiedLabel="IP copiée !"
              className="btn btn-primary btn-sm"
            />
          </div>
          <div className="join-ip-card__meta">
            <span className="badge badge-success">
              <Icon name="check-circle" size={10} />
              Java Edition
            </span>
            <span className="badge badge-muted">Bedrock : non supporté</span>
            <span className="badge badge-muted">IP officielle</span>
          </div>
          <div className="divider" />
          <p className="form-note">
            Le serveur n’est pas encore ouvert au public. Le statut affiché sur
            le site passera automatiquement à « en ligne » dès l’ouverture et la
            configuration DNS de <code>{siteConfig.javaIp}</code>.
          </p>
          <a
            href={siteConfig.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-arrow"
          >
            Suivre l’ouverture sur Discord
            <Icon name="arrow-up-right" size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
