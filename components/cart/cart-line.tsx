"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  removeFromBasketAction,
  updateQuantityAction
} from "@/lib/basket/actions";
import { formatCurrency } from "@/lib/format";
import type { BasketPackage } from "@/lib/tebex/types";
import { Icon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";

export function CartLine({
  item,
  currency
}: {
  item: BasketPackage;
  currency: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(item.quantity);
  const [imageError, setImageError] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

  const isSubscription = item.type === "subscription";
  const image =
    !item.image || imageError
      ? "/images/package-placeholder.svg"
      : item.image;
  const linePrice = Math.round(item.unitPrice * item.quantity * 100) / 100;

  function commit(nextQuantity: number) {
    const next = Math.min(50, Math.max(1, Math.trunc(nextQuantity)));
    setQuantity(next);
    if (next === item.quantity) return;

    startTransition(async () => {
      const result = await updateQuantityAction(item.id, next);
      if (result.success) {
        toast(result.message ?? "Quantité mise à jour.", {
          variant: "success"
        });
        router.refresh();
        return;
      }
      if (result.needsAuth) {
        router.push("/login?next=%2Fcart");
        return;
      }
      toast(result.error, { variant: "error" });
      setQuantity(item.quantity);
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await removeFromBasketAction(item.id);
      if (result.success) {
        toast(result.message ?? "Package retiré.", { variant: "success" });
        router.refresh();
        return;
      }
      toast(result.error, { variant: "error" });
    });
  }

  return (
    <article className="cart-line">
      <Link href={`/package/${item.slug}`} className="cart-line__media">
        <img
          src={image}
          alt={item.name}
          decoding="async"
          onError={() => setImageError(true)}
        />
      </Link>

      <div className="cart-line__info">
        <h3 className="cart-line__title">
          <Link href={`/package/${item.slug}`}>{item.name}</Link>
        </h3>
        {item.options.length > 0 ? (
          <div className="cart-line__options">
            {item.options.map((option) => (
              <span key={`${option.name}-${option.value}`}>
                {option.name} : {option.value}
              </span>
            ))}
          </div>
        ) : null}
        {item.expiryPeriod ? (
          <div className="cart-line__options">
            <span>{item.expiryPeriod}</span>
          </div>
        ) : null}
        <div className="cart-line__price">
          {formatCurrency(linePrice, currency)}
          {item.quantity > 1 ? (
            <span className="muted small">
              {" "}
              · {formatCurrency(item.unitPrice, currency)} / unité
            </span>
          ) : null}
        </div>
      </div>

      <div className="cart-line__actions">
        {isSubscription ? (
          <span className="badge badge-muted">Abonnement</span>
        ) : (
          <div className="qty-stepper">
            <button
              type="button"
              aria-label="Diminuer la quantité"
              onClick={() => commit(quantity - 1)}
              disabled={isPending || quantity <= 1}
            >
              <Icon name="minus" size={13} />
            </button>
            <input
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
              onBlur={() => commit(quantity)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commit(quantity);
                }
              }}
              aria-label={`Quantité de ${item.name}`}
            />
            <button
              type="button"
              aria-label="Augmenter la quantité"
              onClick={() => commit(quantity + 1)}
              disabled={isPending || quantity >= 50}
            >
              <Icon name="plus" size={13} />
            </button>
          </div>
        )}
        <button
          type="button"
          className="cart-line__remove"
          onClick={remove}
          disabled={isPending}
        >
          Retirer
        </button>
      </div>
    </article>
  );
}
