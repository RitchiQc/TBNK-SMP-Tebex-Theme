import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login/login-form";
import { Icon } from "@/components/ui/icons";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { logoutAction } from "@/lib/basket/actions";
import {
  getCurrentBasketSafe,
  getEffectiveUsername
} from "@/lib/basket/session";
import { safeRedirectPath } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { getStoreDataSafe } from "@/lib/tebex/store";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connecte ton pseudo Minecraft pour associer ton panier TBNK-SMP et recevoir tes achats en jeu.",
  robots: { index: false, follow: false }
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [username, basket, { isMock }, params] = await Promise.all([
    getEffectiveUsername(),
    getCurrentBasketSafe(),
    getStoreDataSafe(),
    searchParams
  ]);

  const next = safeRedirectPath(params.next ?? "/cart");
  const basketCount =
    basket?.packages.reduce((total, item) => total + item.quantity, 0) ?? 0;

  return (
    <>
      <section className="page-hero">
        <div className="container-tbnk page-hero__inner">
          <nav className="breadcrumb" aria-label="Fil d’Ariane">
            <Link href="/">Accueil</Link>
            <span>/</span>
            <b>{username ? "Mon compte" : "Connexion"}</b>
          </nav>
          <span className="eyebrow" style={{ marginTop: 18 }}>
            Compte Minecraft
          </span>
          <h1>{username ? "Ton compte TBNK-SMP" : "Qui es-tu, joueur ?"}</h1>
          <p>
            {username
              ? "Ton pseudo est associé à ton panier et à la livraison de tes achats."
              : "Entre ton pseudo Minecraft Java pour continuer. Aucun mot de passe n’est demandé : Tebex associe simplement ton identité au panier."}
          </p>
          {isMock ? (
            <div className="page-hero__meta">
              <span className="badge badge-accent">Mode démo</span>
            </div>
          ) : null}
        </div>
      </section>

      <div className="container-tbnk" style={{ paddingBottom: 34 }}>
        {username ? (
          <div className="form-card" style={{ maxWidth: 760 }}>
            <div className="account-card">
              <PlayerAvatar username={username} size={72} className="avatar--lg" />
              <div className="account-card__info">
                <div className="account-card__name">{username}</div>
                <p className="account-card__meta">
                  Compte Minecraft associé · {basketCount}{" "}
                  {basketCount > 1 ? "articles" : "article"} dans le panier
                </p>
              </div>
              <span className="badge badge-success">
                <Icon name="check-circle" size={10} />
                Connecté
              </span>
            </div>

            <div className="account-actions">
              <Link href="/cart" className="btn btn-primary">
                <Icon name="cart" size={16} />
                Voir mon panier
              </Link>
              <Link href="/store" className="btn btn-secondary">
                <Icon name="store" size={16} />
                Continuer mes achats
              </Link>
              <a
                href={siteConfig.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <Icon name="discord" size={16} />
                Support Discord
              </a>
            </div>

            <div className="divider" />

            <p className="form-note">
              Pour changer de pseudo, déconnecte-toi puis reconnecte-toi avec le
              bon compte. Le panier actuel sera réinitialisé si le pseudo change.
            </p>

            <form action={logoutAction} style={{ marginTop: 16 }}>
              <button type="submit" className="btn btn-danger">
                <Icon name="logout" size={16} />
                Se déconnecter
              </button>
            </form>
          </div>
        ) : (
          <div className="login-layout">
            <div className="login-aside">
              <div>
                <span className="eyebrow">Pourquoi se connecter ?</span>
                <h2>Ton pseudo, ta livraison.</h2>
                <p>
                  TBNK-SMP utilise ton pseudo Minecraft pour identifier tes
                  achats et les livrer au bon joueur. C’est rapide, sans mot de
                  passe, et tes informations restent gérées par Tebex.
                </p>
                <div className="login-aside__benefits">
                  <div className="login-aside__benefit">
                    <Icon name="check-circle" size={16} />
                    Livraison automatique en jeu
                  </div>
                  <div className="login-aside__benefit">
                    <Icon name="shield" size={16} />
                    Paiement sécurisé par Tebex
                  </div>
                  <div className="login-aside__benefit">
                    <Icon name="discord" size={16} />
                    Support disponible sur Discord
                  </div>
                  <div className="login-aside__benefit">
                    <Icon name="refresh" size={16} />
                    Panier conservé pendant 7 jours
                  </div>
                </div>
              </div>
              <a
                href={siteConfig.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <Icon name="discord" size={16} />
                Besoin d’aide ? Rejoins le Discord
              </a>
            </div>

            <div className="login-card">
              <h1>Connexion</h1>
              <p>
                Utilise ton pseudo Minecraft Java. Si tu n’as jamais acheté, ton
                compte sera créé automatiquement lors du paiement.
              </p>
              <LoginForm next={next} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
