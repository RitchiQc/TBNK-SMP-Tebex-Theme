import { cookies } from "next/headers";
import type { PendingAdd } from "./action-types";

export const BASKET_COOKIE = "tbnk_basket_ident";
export const USERNAME_COOKIE = "tbnk_username";
export const MOCK_BASKET_COOKIE = "tbnk_mock_basket";
export const PENDING_ADD_COOKIE = "tbnk_pending_add";

const MAX_AGE = 60 * 60 * 24 * 7;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE
  };
}

function decodeJson<T>(value: string | undefined): T | null {
  if (!value) return null;

  const attempts = [
    value,
    (() => {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    })(),
    (() => {
      try {
        return decodeURIComponent(decodeURIComponent(value));
      } catch {
        return value;
      }
    })()
  ];

  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt) as T;
    } catch {
      // Essaie l'encodage suivant.
    }
  }

  return null;
}

export async function getUsernameCookie(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(USERNAME_COOKIE)?.value?.trim();
  return value ? value : null;
}

export async function setUsernameCookie(username: string): Promise<void> {
  const store = await cookies();
  store.set(USERNAME_COOKIE, username, cookieOptions());
}

export async function clearUsernameCookie(): Promise<void> {
  const store = await cookies();
  store.delete(USERNAME_COOKIE);
}

export async function getBasketIdentCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(BASKET_COOKIE)?.value ?? null;
}

export async function setBasketIdentCookie(ident: string): Promise<void> {
  const store = await cookies();
  store.set(BASKET_COOKIE, ident, cookieOptions());
}

export async function clearBasketIdentCookie(): Promise<void> {
  const store = await cookies();
  store.delete(BASKET_COOKIE);
}

export async function getMockBasketCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(MOCK_BASKET_COOKIE)?.value ?? null;
}

export async function setMockBasketCookie(value: string): Promise<void> {
  const store = await cookies();
  store.set(MOCK_BASKET_COOKIE, value, cookieOptions());
}

export async function clearMockBasketCookie(): Promise<void> {
  const store = await cookies();
  store.delete(MOCK_BASKET_COOKIE);
}

export async function getPendingAddCookie(): Promise<PendingAdd | null> {
  const store = await cookies();
  return decodeJson<PendingAdd>(store.get(PENDING_ADD_COOKIE)?.value);
}

export async function setPendingAddCookie(
  pending: PendingAdd
): Promise<void> {
  const store = await cookies();
  store.set(PENDING_ADD_COOKIE, JSON.stringify(pending), cookieOptions());
}

export async function clearPendingAddCookie(): Promise<void> {
  const store = await cookies();
  store.delete(PENDING_ADD_COOKIE);
}
