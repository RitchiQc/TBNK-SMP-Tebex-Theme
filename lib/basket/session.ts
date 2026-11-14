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
 * Lecture seule : ne crée jamais de panier et n'écrit aucun cookie.
 * Utilisable dans les layouts, pages et server components.
 */
export async function getCurrentBasket(): Promise<Basket | null> {
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
}

/**
 * Lecture ou création : à appeler uniquement depuis une Server Action
 * ou un Route Handler (car cette fonction peut écrire le cookie).
 */
export async function ensureBasket(username?: string): Promise<Basket> {
  if (isMockMode) {
    const resolvedUsername = username ?? (await getUsernameCookie());
    const raw = await getMockBasketCookie();
    return buildMockBasket(parseMockBasketData(raw), resolvedUsername);
  }

  const existing = await getCurrentBasket();
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

export async function getEffectiveUsername(): Promise<string | null> {
  const basket = await getCurrentBasket();
  return basket?.username ?? (await getUsernameCookie());
}

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
  const basket = await getCurrentBasket();
  return {
    count: basketItemCount(basket),
    username: basket?.username ?? (await getUsernameCookie()),
    isMock: isMockMode
  };
}

export async function clearBasketSession(): Promise<void> {
  await clearBasketIdentCookie();
  await clearMockBasketCookie();
}
