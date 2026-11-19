"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToBasketAction } from "@/lib/basket/actions";
import { formatCurrency } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import type { Package } from "@/lib/tebex/types";
import { Icon } from "@/components/ui/icons";
import { ProductImage } from "@/components/ui/product-image";
import { useToast } from "@/components/ui/toast";

const quantityOptions = [1, 5, 10, 20];

export function ProductCard({
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

  const isSubscription = pkg.type === "subscription" || pkg.type === "both";
  const needsConfiguration = pkg.variables.length > 0;

  function addToBasket() {
    startTransition(async () => {
      const result = await addToBasketAction({
        packageId: pkg.ident,
        quantity: isSubscription || pkg.disableQuantity ? 1 : quantity,
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
    <article className="product-card">
      <Link
        href={`/package/${pkg.slug}`}
        className="product-card__media"
        aria-label={`Voir ${pkg.name}`}
      >
        <div className="product-card__badges">
          {pkg.discountPercent > 0 ? (
            <span className="badge badge-danger">-{pkg.discountPercent}%</span>
          ) : null}
          {pkg.popular ? (
            <span className="badge badge-accent">
              <Icon name="star" size={10} />
              Populaire
            </span>
          ) : null}
          {isSubscription ? (
            <span className="badge badge-muted">Abonnement</span>
          ) : null}
        </div>
        <ProductImage
          className="product-card__img"
          src={pkg.image}
          pkg={pkg.ident}
          alt={pkg.name}
          loading="lazy"
        />
      </Link>

      <div className="product-card__body">
        <span className="product-card__category">{pkg.categoryName}</span>
        <h3 className="product-card__title">
          <Link href={`/package/${pkg.slug}`}>{pkg.name}</Link>
        </h3>
        <div
          className="product-card__perks"
          dangerouslySetInnerHTML={{ __html: pkg.description }}
        />

        <div className="product-card__footer">
          <div className="price">
            {pkg.discountPercent > 0 ? (
              <del className="price__old">
                {formatCurrency(pkg.basePrice, currency)}
              </del>
            ) : null}
            <strong className="price__current">
              {pkg.totalPrice === 0
                ? "Gratuit"
                : formatCurrency(pkg.totalPrice, currency)}
            </strong>
            {isSubscription ? (
              <span className="price__suffix">
                {pkg.billingPeriod ? ` / ${pkg.billingPeriod}` : " / période"}
              </span>
            ) : null}
            <span className="price__tax">{siteConfig.taxNote}</span>
          </div>

          <div className="product-card__actions">
            {needsConfiguration ? (
              <Link
                href={`/package/${pkg.slug}`}
                className="btn btn-primary btn-wide btn-sm"
              >
                <Icon name="sparkles" size={14} />
                Configurer
              </Link>
            ) : (
              <>
                {!pkg.disableQuantity && !isSubscription ? (
                  <div className="qty-row" aria-label="Choisir la quantité">
                    <span className="qty-label">Qté</span>
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
                ) : null}
                <button
                  type="button"
                  className="btn btn-primary btn-wide btn-sm"
                  onClick={addToBasket}
                  disabled={isPending}
                >
                  {isPending ? (
                    <span className="spinner" />
                  ) : (
                    <Icon name={isSubscription ? "crown" : "cart"} size={15} />
                  )}
                  {isSubscription ? "S’abonner" : "Ajouter au panier"}
                </button>
              </>
            )}

            {inBasketQuantity > 0 ? (
              <p className="product-card__hint">
                Déjà dans le panier : <strong>{inBasketQuantity}</strong> ·{" "}
                <Link href="/cart">Voir le panier</Link>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
