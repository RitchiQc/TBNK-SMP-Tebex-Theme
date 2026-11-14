"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToBasketAction } from "@/lib/basket/actions";
import { formatCurrency } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import type { Package } from "@/lib/tebex/types";
import { Icon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";

const quantityOptions = [1, 5, 10, 20];

function labelForVariable(identifier: string): string {
  return identifier
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function PackagePurchase({
  pkg,
  currency,
  inBasketQuantity = 0,
  returnPath
}: {
  pkg: Package;
  currency: string;
  inBasketQuantity?: number;
  returnPath: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        pkg.variables.map((variable) => [
          variable.identifier,
          variable.type === "dropdown"
            ? variable.options[0]?.value ?? ""
            : ""
        ])
      )
  );

  const isSubscription = pkg.type === "subscription" || pkg.type === "both";
  const allVariablesFilled = pkg.variables.every((variable) =>
    (variableValues[variable.identifier] ?? "").trim()
  );

  function add() {
    startTransition(async () => {
      const result = await addToBasketAction({
        packageId: pkg.ident,
        quantity: isSubscription || pkg.disableQuantity ? 1 : quantity,
        variableData: pkg.variables.length > 0 ? variableValues : undefined,
        returnPath
      });

      if (result.success) {
        toast(result.message ?? "Package ajouté au panier.", {
          variant: "success",
          action: { label: "Voir le panier", href: "/cart" }
        });
        router.refresh();
        return;
      }

      if (result.needsLogin) {
        router.push(`/login?next=${encodeURIComponent(returnPath)}`);
        return;
      }

      toast(result.error, { variant: "error" });
    });
  }

  return (
    <div className="purchase-panel">
      <div className="purchase-panel__head">
        <div>
          <span className="purchase-panel__label">Prix</span>
          <div className="purchase-panel__price">
            {pkg.discountPercent > 0 ? (
              <del>{formatCurrency(pkg.basePrice, currency)}</del>
            ) : null}
            <strong>
              {pkg.totalPrice === 0
                ? "Gratuit"
                : formatCurrency(pkg.totalPrice, currency)}
            </strong>
            {isSubscription ? (
              <span>
                {pkg.billingPeriod ? ` / ${pkg.billingPeriod}` : " / période"}
              </span>
            ) : null}
          </div>
          <p className="price__tax">{siteConfig.taxNote}</p>
          {isSubscription ? (
            <p className="form-note">
              Abonnement récurrent : la fréquence, le montant récurrent et les
              modalités d’annulation sont confirmés sur la page de paiement
              Tebex.
            </p>
          ) : null}
        </div>
        {pkg.discountPercent > 0 ? (
          <span className="badge badge-danger">-{pkg.discountPercent}%</span>
        ) : null}
      </div>

      {pkg.variables.map((variable) => (
        <div className="variable-field" key={variable.identifier}>
          <label htmlFor={`variable-${variable.identifier}`}>
            {labelForVariable(variable.identifier)}
          </label>
          {variable.type === "dropdown" ? (
            <select
              id={`variable-${variable.identifier}`}
              className="select"
              value={variableValues[variable.identifier] ?? ""}
              onChange={(event) =>
                setVariableValues((current) => ({
                  ...current,
                  [variable.identifier]: event.target.value
                }))
              }
              required
            >
              {variable.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`variable-${variable.identifier}`}
              className="input"
              type={variable.type === "email" ? "email" : "text"}
              value={variableValues[variable.identifier] ?? ""}
              onChange={(event) =>
                setVariableValues((current) => ({
                  ...current,
                  [variable.identifier]: event.target.value
                }))
              }
              placeholder={`Entre ${labelForVariable(variable.identifier).toLowerCase()}`}
              required
            />
          )}
        </div>
      ))}

      {!pkg.disableQuantity && !isSubscription ? (
        <div className="package-quantity">
          <label htmlFor="package-quantity">Quantité</label>
          <div className="qty-stepper">
            <button
              type="button"
              aria-label="Diminuer la quantité"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              <Icon name="minus" size={14} />
            </button>
            <input
              id="package-quantity"
              type="number"
              min={1}
              max={50}
              value={quantity}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (Number.isFinite(value) && value >= 1) {
                  setQuantity(Math.min(50, Math.trunc(value)));
                }
              }}
              aria-label="Quantité"
            />
            <button
              type="button"
              aria-label="Augmenter la quantité"
              onClick={() => setQuantity((value) => Math.min(50, value + 1))}
            >
              <Icon name="plus" size={14} />
            </button>
          </div>
          <div className="qty-row">
            {quantityOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`qty-chip${quantity === option ? " is-active" : ""}`}
                onClick={() => setQuantity(option)}
                aria-pressed={quantity === option}
              >
                {option}x
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="purchase-panel__actions">
        <button
          type="button"
          className="btn btn-primary btn-lg btn-wide"
          onClick={add}
          disabled={isPending || !allVariablesFilled}
        >
          {isPending ? (
            <span className="spinner" />
          ) : (
            <Icon name={isSubscription ? "crown" : "cart"} size={18} />
          )}
          {isSubscription ? "S’abonner maintenant" : "Ajouter au panier"}
        </button>
        {inBasketQuantity > 0 ? (
          <a href="/cart" className="btn btn-secondary btn-wide">
            <Icon name="cart" size={16} />
            Voir le panier ({inBasketQuantity})
          </a>
        ) : null}
      </div>

      <ul
        className="package-benefits"
        style={{ listStyle: "none", padding: 0 }}
      >
        <li>
          <Icon name="check-circle" size={14} />
          Livraison instantanée en jeu après paiement
        </li>
        <li>
          <Icon name="shield" size={14} />
          Paiement sécurisé par Tebex
        </li>
        <li>
          <Icon name="discord" size={14} />
          Support disponible sur Discord
        </li>
      </ul>

      <p className="purchase-panel__note">
        En achetant, tu acceptes les{" "}
        <a href="/legal/terms">conditions d’utilisation</a> et la{" "}
        <a href="/legal/refund">politique de remboursement</a>.
      </p>
    </div>
  );
}
