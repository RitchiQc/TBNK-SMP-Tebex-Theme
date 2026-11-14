"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { rateLimit } from "@/lib/rate-limit";
import {
  getBasketAuthProvidersRaw,
  isMockMode
} from "@/lib/tebex/client";
import { mapAuthProviders } from "@/lib/tebex/mapper";
import { getWebstore } from "@/lib/tebex/store";
import type { CheckoutResult } from "./action-types";
import {
  clearBasketIdentCookie,
  clearMockBasketCookie,
  getUsernameCookie
} from "./cookies";
import { getCurrentBasket } from "./session";

export async function prepareCheckoutAction(): Promise<CheckoutResult> {
  if (isMockMode) {
    return { mode: "demo" };
  }

  if (!(await rateLimit("basket:checkout", 10, 60_000))) {
    return {
      mode: "error",
      error: "Trop de tentatives. Réessaie dans une minute."
    };
  }

  try {
    const webstore = await getWebstore();
    if (webstore.disabled) {
      return {
        mode: "error",
        error: "La boutique est temporairement fermée."
      };
    }

    const basket = await getCurrentBasket();

    if (!basket || basket.packages.length === 0) {
      return { mode: "error", error: "Ton panier est vide." };
    }

    const username = await getUsernameCookie();
    if (
      username &&
      basket.username &&
      basket.username.toLowerCase() !== username.toLowerCase()
    ) {
      await clearBasketIdentCookie();
      return {
        mode: "error",
        error:
          "Ce panier ne correspond pas à ton pseudo. Reconnecte-toi pour continuer."
      };
    }

    if (basket.checkoutUrl) {
      return {
        mode: "checkout",
        ident: basket.ident,
        url: basket.checkoutUrl
      };
    }

    const providers = mapAuthProviders(
      await getBasketAuthProvidersRaw(
        basket.ident,
        `${siteConfig.url}/cart`
      )
    );

    if (providers.length > 0) {
      return { mode: "auth", url: providers[0].url };
    }

    return {
      mode: "error",
      error:
        "Impossible de préparer le paiement. Réessaie ou contacte-nous sur Discord."
    };
  } catch (error) {
    console.error("[checkout] preparation failed", error);
    return {
      mode: "error",
      error:
        "Impossible de préparer le paiement pour le moment. Réessaie dans un instant."
    };
  }
}

export async function clearDemoBasketAction(): Promise<void> {
  if (!(await rateLimit("basket:demo-clear", 20, 60_000))) {
    return;
  }

  await clearMockBasketCookie();
  revalidatePath("/cart");
  revalidatePath("/", "layout");
  redirect("/cart");
}
