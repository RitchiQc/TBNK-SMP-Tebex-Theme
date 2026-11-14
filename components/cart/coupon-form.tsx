"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  applyCouponAction,
  removeCouponAction
} from "@/lib/basket/actions";
import type { Coupon } from "@/lib/tebex/types";
import { Icon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";

export function CouponForm({
  coupons,
  isMock
}: {
  coupons: Coupon[];
  isMock: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = code.trim();
    if (!value) return;

    startTransition(async () => {
      const result = await applyCouponAction(value);
      if (result.success) {
        toast(result.message ?? "Code promo appliqué.", {
          variant: "success"
        });
        setCode("");
        router.refresh();
        return;
      }
      toast(result.error, { variant: "error" });
    });
  }

  function remove(couponCode: string) {
    startTransition(async () => {
      const result = await removeCouponAction(couponCode);
      if (result.success) {
        toast(result.message ?? "Code promo retiré.", { variant: "success" });
        router.refresh();
        return;
      }
      toast(result.error, { variant: "error" });
    });
  }

  return (
    <div className="form-row">
      <form className="coupon-form" onSubmit={apply}>
        <input
          className="input"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Code promo"
          aria-label="Code promo"
        />
        <button
          type="submit"
          className="btn btn-secondary btn-sm"
          disabled={isPending || !code.trim()}
        >
          {isPending ? <span className="spinner" /> : "Appliquer"}
        </button>
      </form>

      {coupons.length > 0 ? (
        <div className="coupon-list">
          {coupons.map((coupon) => (
            <span className="coupon-pill" key={coupon.code}>
              <Icon name="check" size={11} />
              {coupon.code}
              <button
                type="button"
                onClick={() => remove(coupon.code)}
                aria-label={`Retirer le code ${coupon.code}`}
                disabled={isPending}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {isMock ? (
        <p className="form-note">
          Mode démo : utilise le code <strong>TBNK10</strong> pour tester une
          réduction de 10 %.
        </p>
      ) : null}
    </div>
  );
}
