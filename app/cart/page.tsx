import type { Metadata } from "next";
import Link from "next/link";
import { CartLine } from "@/components/cart/cart-line";
import { CheckoutButton } from "@/components/cart/checkout-button";
import { CouponForm } from "@/components/cart/coupon-form";
import { Icon } from "@/components/ui/icons";
import { getBasketIdentCookie } from "@/lib/basket/cookies";
import {
  getCurrentBasketSafe,
  getEffectiveUsername
} from "@/lib/basket/session";
import { formatCurrency } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { getStoreDataSafe } from "@/lib/tebex/store";

export const metadata: Metadata = {
  title: "Panier",
  description: "Récupère ton panier TBNK-SMP et passe au paiement sécurisé Tebex.",
  robots: { index: false, follow: false }
};

export default async function CartPage() {
  const [basket, username, store, basketIdent] = await Promise.all([
    getCurrentBasketSafe(),
    getEffectiveUsername(),
    getStoreDataSafe(),
    getBasketIdentCookie()
  ]);

  const currency = basket?.currency || siteConfig.currency;
  const isEmpty = !basket || basket.packages.length === 0;
  const cartUnavailable = Boolean(basketIdent) && !basket;
  const unavailable = store.unavailable || cartUnavailable;

  return (
    <>
      <section className="page-hero">
        <div className="container-tbnk page-hero__inner">
          <nav className="breadcrumb" aria-label="Fil d’Ariane">
            <Link href="/">Accueil</Link>
            <span>/</span>
            <b>Panier</b>
          </nav>
          <span className="eyebrow" style={{ marginTop: 18 }}>
            Ton panier
          </span>
          <h1>Finalise ton achat</h1>
          <p>
            Vérifie les articles, ajuste les quantités et passe au paiement
            sécurisé Tebex. La livraison en jeu est automatique pour les articles
            éligibles.
          </p>
          <div className="checkout-steps">
            <span className="step is-active">
              <span className="step__number">1</span>
              Panier
            </span>
            <span className="step">
              <span className="step__number">2</span>
              Paiement
            </span>
            <span className="step">
              <span className="step__number">3</span>
              Livraison
            </span>
          </div>
        </div>
      </section>

      <div className="container-tbnk" style={{ paddingBottom: 30 }}>
        {unavailable ? (
          <div className="cart-login-banner" style={{ marginBottom: 16 }}>
            <p>
              <b>Panier temporairement indisponible.</b> Tebex ne répond pas
              pour le moment. Ton panier n’est pas perdu : recharge la page dans
              un instant.
            </p>
          </div>
        ) : null}

        {isEmpty ? (
          <div className="empty-state">
            <span className="empty-state__icon">
              <Icon name="cart" size={26} />
            </span>
            <h2>
              {unavailable
                ? "Impossible de charger ton panier"
                : "Ton panier est vide"}
            </h2>
            <p>
              {unavailable
                ? "Réessaie dans quelques instants. Si le problème persiste, contacte le support Discord."
                : "Parcours la boutique et ajoute un rang, une clé ou un cosmétique pour commencer."}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link href="/store" className="btn btn-primary btn-sm">
                <Icon name="store" size={15} />
                Découvrir la boutique
              </Link>
              <a
                href={siteConfig.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <Icon name="discord" size={15} />
                Discord
              </a>
            </div>
          </div>
        ) : (
          <>
            {!username ? (
              <div className="cart-login-banner" style={{ marginBottom: 16 }}>
                <p>
                  <b>Connecte ton pseudo Minecraft</b> pour associer le panier à
                  ton compte et recevoir tes achats en jeu.
                </p>
                <Link href="/login?next=%2Fcart" className="btn btn-primary btn-sm">
                  <Icon name="user" size={15} />
                  Se connecter
                </Link>
              </div>
            ) : null}

            <div className="cart-layout">
              <div className="cart-list">
                {basket.packages.map((item) => (
                  <CartLine key={item.id} item={item} currency={currency} />
                ))}
              </div>

              <aside className="cart-summary">
                <h2>Résumé</h2>
                <CouponForm coupons={basket.coupons} isMock={basket.isMock} />

                <div className="form-row">
                  <div className="summary-row">
                    <span>Sous-total</span>
                    <strong>{formatCurrency(basket.basePrice, currency)}</strong>
                  </div>
                  {/*
                    Tebex retourne `base_price` déjà net des remises et
                    `total_price = base_price + sales_tax`. Déduire une remise
                    de `basePrice - totalPrice` serait donc faux dès qu'il y a
                    des taxes. On ne l'affiche qu'en mode démo, où salesTax = 0.
                  */}
                  {basket.isMock && basket.basePrice > basket.totalPrice ? (
                    <div className="summary-row summary-row--discount">
                      <span>Réductions</span>
                      <strong>
                        -
                        {formatCurrency(
                          basket.basePrice - basket.totalPrice,
                          currency
                        )}
                      </strong>
                    </div>
                  ) : null}
                  {basket.salesTax > 0 ? (
                    <div className="summary-row">
                      <span>Taxes</span>
                      <strong>
                        {formatCurrency(basket.salesTax, currency)}
                      </strong>
                    </div>
                  ) : null}
                </div>

                <div className="summary-total">
                  <span>Total</span>
                  <strong>{formatCurrency(basket.totalPrice, currency)}</strong>
                </div>

                <p className="form-note" style={{ marginBottom: 12 }}>
                  {siteConfig.taxNote} Le montant final et les taxes applicables
                  sont confirmés sur la page de paiement Tebex.
                </p>

                <CheckoutButton
                  disabled={basket.packages.length === 0}
                  isMock={basket.isMock}
                />

                <div className="cart-trust">
                  <span>
                    <Icon name="shield" size={12} /> Paiement sécurisé Tebex
                  </span>
                  <span>
                    <Icon name="bolt" size={12} /> Livraison instantanée
                  </span>
                </div>

                <Link
                  href="/store"
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: "center" }}
                >
                  Continuer mes achats
                </Link>
              </aside>
            </div>
          </>
        )}
      </div>
    </>
  );
}
