"use client";

import { useEffect, useState, useTransition } from "react";
import {
  clearDemoBasketAction,
  prepareCheckoutAction
} from "@/lib/basket/checkout-actions";
import { siteConfig } from "@/lib/site";
import { Icon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";

function isSafeCheckoutUrl(value: string | null): value is string {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function CheckoutButton({
  disabled,
  isMock
}: {
  disabled?: boolean;
  isMock: boolean;
}) {
  const { toast } = useToast();
  const [demoOpen, setDemoOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!demoOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDemoOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [demoOpen]);

  function checkout() {
    startTransition(async () => {
      const result = await prepareCheckoutAction();

      if (result.mode === "demo") {
        setDemoOpen(true);
        return;
      }

      if (result.mode === "auth") {
        if (!isSafeCheckoutUrl(result.url)) {
          toast("Lien d'authentification Tebex invalide.", {
            variant: "error"
          });
          return;
        }
        window.location.href = result.url;
        return;
      }

      if (result.mode === "checkout") {
        if (window.Tebex?.checkout) {
          try {
            window.Tebex.checkout.init({
              ident: result.ident,
              theme: "dark",
              colors: [{ name: "primary", color: siteConfig.accent }]
            });
            window.Tebex.checkout.launch();
            return;
          } catch {
            // Fallback vers l'URL de checkout hébergée ci-dessous.
          }
        }

        if (isSafeCheckoutUrl(result.url)) {
          window.location.href = result.url;
          return;
        }

        toast("Lien de paiement Tebex invalide.", { variant: "error" });
        return;
      }

      if (result.mode === "error") {
        toast(result.error, { variant: "error" });
        return;
      }

      toast(
        "Impossible de préparer le paiement. Réessaie ou contacte-nous sur Discord.",
        { variant: "error" }
      );
    });
  }

  function clearDemo() {
    startTransition(async () => {
      await clearDemoBasketAction();
    });
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-primary btn-lg btn-wide"
        onClick={checkout}
        disabled={disabled || isPending}
      >
        {isPending ? (
          <span className="spinner" />
        ) : (
          <Icon name="lock" size={17} />
        )}
        Passer au paiement
      </button>

      <p className="purchase-panel__note" style={{ marginTop: 10 }}>
        Paiement sécurisé et traité par Tebex.{" "}
        {isMock ? "Mode démo : le paiement est simulé." : null}
      </p>

      {demoOpen ? (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setDemoOpen(false)}
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-checkout-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal__header">
              <div>
                <h2 id="demo-checkout-title">Paiement Tebex</h2>
                <p>Le tunnel de paiement est prêt.</p>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Fermer"
                onClick={() => setDemoOpen(false)}
              >
                <Icon name="close" size={17} />
              </button>
            </div>
            <div className="modal__body">
              <p>
                Le site tourne actuellement en <strong>mode démo</strong>. Le
                panier, les quantités et les codes promo fonctionnent, mais
                aucun paiement réel ne peut être effectué.
              </p>
              <p style={{ marginTop: 10 }}>
                Pour activer le paiement, ajoute le token public Tebex dans{" "}
                <code>TEBEX_PUBLIC_TOKEN</code> puis redéploie le site. Tebex
                prendra alors en charge le paiement et la livraison en jeu.
              </p>
            </div>
            <div className="modal__actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDemoOpen(false)}
              >
                Continuer la visite
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={clearDemo}
                disabled={isPending}
              >
                Vider le panier démo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
