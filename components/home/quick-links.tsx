import Link from "next/link";
import { siteConfig } from "@/lib/site";
import type { DiscordStats, ServerStatus } from "@/lib/tebex/types";
import { Icon } from "@/components/ui/icons";

export function QuickLinks({
  discord,
  serverStatus,
  packageCount
}: {
  discord: DiscordStats;
  serverStatus: ServerStatus;
  packageCount: number;
}) {
  return (
    <section className="container-tbnk home-section home-section--tight">
      <div className="quick-grid">
        <Link href="/store" className="quick-card">
          <div className="quick-card__top">
            <span className="icon-tile">
              <Icon name="store" size={22} />
            </span>
            <Icon name="arrow-up-right" size={18} className="quick-card__arrow" />
          </div>
          <div>
            <div className="quick-card__title">Boutique</div>
            <p className="quick-card__text">
              Rangs, clés, cosmétiques et boosters pour aller plus loin.
            </p>
          </div>
          <div className="quick-card__stat">{packageCount} articles</div>
        </Link>

        <a
          href={siteConfig.discordUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="quick-card"
        >
          <div className="quick-card__top">
            <span className="icon-tile">
              <Icon name="discord" size={22} />
            </span>
            <Icon name="external" size={18} className="quick-card__arrow" />
          </div>
          <div>
            <div className="quick-card__title">Discord</div>
            <p className="quick-card__text">
              Annonces, entraide, événements et giveaways de la communauté.
            </p>
          </div>
          <div className="quick-card__stat">
            {discord.members.toLocaleString("fr-CA")} membres
          </div>
        </a>

        <Link href="/status" className="quick-card">
          <div className="quick-card__top">
            <span className="icon-tile">
              <Icon name="server" size={22} />
            </span>
            <Icon name="arrow-up-right" size={18} className="quick-card__arrow" />
          </div>
          <div>
            <div className="quick-card__title">Statut</div>
            <p className="quick-card__text">
              État du serveur, joueurs connectés et informations techniques.
            </p>
          </div>
          <div className="quick-card__stat">
            {serverStatus.online ? "En ligne" : "Bientôt"}
          </div>
        </Link>

        <Link href="/guide" className="quick-card">
          <div className="quick-card__top">
            <span className="icon-tile">
              <Icon name="gamepad" size={22} />
            </span>
            <Icon name="arrow-up-right" size={18} className="quick-card__arrow" />
          </div>
          <div>
            <div className="quick-card__title">Comment rejoindre</div>
            <p className="quick-card__text">
              Java uniquement. Ajoute l’IP et retrouve-nous en jeu.
            </p>
          </div>
          <div className="quick-card__stat">Java Edition</div>
        </Link>
      </div>
    </section>
  );
}
