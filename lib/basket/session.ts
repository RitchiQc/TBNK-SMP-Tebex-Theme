import "server-only";

import { cache } from "react";
import {
  createBasketRaw,
  getBasketRaw,
  isMockMode
} from "@/lib/tebex/client";
import { mapBasket } from "@/lib/tebex/mapper";
import type { Basket } from "@/lib/tebex/types";
import {
  clearBasketIdentCookie,
  clearMockBasketCookie,
  getBasketIdentCookie,
  getMockBasketCookie,
  getUsernameCookie,
  setBasketIdentCookie
} from "./cookies";
import { buildMockBasket, parseMockBasketData } from "./mock";

function unwrapBasket(raw: unknown): unknown {
  if (
    raw &&
    typeof raw === "object" &&
    "data" in raw &&
    (raw as Record<string, unknown>).data !== undefined
  ) {
    return (raw as Record<string, unknown>).data;
  }
  return raw;
}

/**
 * Next utilise une erreur interne (`DYNAMIC_SERVER_USAGE`) pour marquer une
 * route comme dynamique quand elle lit `cookies()`. Il ne faut pas l'avaler
 * dans nos fallbacks, sinon Next tente de générer la page statiquement.
 */
function isNextDynamicServerError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    (error as { digest?: unknown }).digest === "DYNAMIC_SERVER_USAGE"
  );
}

/**
 * Lecture seule : ne crée jamais de panier et n'écrit aucun cookie.
 * Utilisable dans les layouts, pages et server components.
 * `cache()` évite de refaire le même GET Tebex plusieurs fois par requête
 * (header + page + getEffectiveUsername).
 */
export const getCurrentBasket = cache(async (): Promise<Basket | null> => {
  if (isMockMode) {
    const username = await getUsernameCookie();
    const raw = await getMockBasketCookie();
    return buildMockBasket(parseMockBasketData(raw), username);
  }

  const ident = await getBasketIdentCookie();
  if (!ident) return null;

  const raw = await getBasketRaw(ident);
  if (!raw) return null;

  return mapBasket(unwrapBasket(raw));
});

/**
 * Lecture ou création : à appeler uniquement depuis une Server Action
 * ou un Route Handler (car cette fonction peut écrire le cookie).
 */
export async function ensureBasket(
  username?: string,
  options?: { forceNew?: boolean }
): Promise<Basket> {
  if (isMockMode) {
    const resolvedUsername = username ?? (await getUsernameCookie());
    const raw = await getMockBasketCookie();
    return buildMockBasket(parseMockBasketData(raw), resolvedUsername);
  }

  const existing = options?.forceNew ? null : await getCurrentBasket();
  if (existing) return existing;

  const resolvedUsername = username ?? (await getUsernameCookie()) ?? undefined;
  const raw = await createBasketRaw(resolvedUsername);
  if (!raw) {
    throw new Error("Tebex n'a pas retourné de panier.");
  }

  const basket = mapBasket(unwrapBasket(raw));
  if (!basket.ident) {
    throw new Error("Le panier Tebex créé ne contient pas d'identifiant.");
  }

  await setBasketIdentCookie(basket.ident);
  return basket;
}

export const getEffectiveUsername = async (): Promise<string | null> => {
  try {
    const basket = await getCurrentBasket();
    return basket?.username ?? (await getUsernameCookie());
  } catch (error) {
    if (isNextDynamicServerError(error)) throw error;
    console.error("[basket] username unavailable", error);
    try {
      return await getUsernameCookie();
    } catch (cookieError) {
      if (isNextDynamicServerError(cookieError)) throw cookieError;
      return null;
    }
  }
};

/**
 * Variante utilisée par les pages catalogue : une panne du panier ne doit pas
 * empêcher d'afficher les produits.
 */
export const getCurrentBasketSafe = cache(
  async (): Promise<Basket | null> => {
    try {
      return await getCurrentBasket();
    } catch (error) {
      if (isNextDynamicServerError(error)) throw error;
      console.error("[basket] basket unavailable", error);
      return null;
    }
  }
);

export function basketItemCount(basket: Basket | null): number {
  if (!basket) return 0;
  return basket.packages.reduce(
    (total, item) => total + (Number.isFinite(item.quantity) ? item.quantity : 0),
    0
  );
}

export async function getHeaderBasket(): Promise<{
  count: number;
  username: string | null;
  isMock: boolean;
}> {
  try {
    const basket = await getCurrentBasket();
    return {
      count: basketItemCount(basket),
      username: basket?.username ?? (await getUsernameCookie()),
      isMock: isMockMode
    };
  } catch (error) {
    if (isNextDynamicServerError(error)) throw error;
    console.error("[basket] header unavailable", error);
    let username: string | null = null;
    try {
      username = await getUsernameCookie();
    } catch (cookieError) {
      if (isNextDynamicServerError(cookieError)) throw cookieError;
      // Le cookie n'est pas critique pour afficher le header.
    }
    return { count: 0, username, isMock: isMockMode };
  }
}

export async function clearBasketSession(): Promise<void> {
  await clearBasketIdentCookie();
  await clearMockBasketCookie();
}
