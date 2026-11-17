import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { cookieSecret, isPreview, isProduction } from "@/lib/env";
import { safeRedirectPath } from "@/lib/format";
import { USERNAME_PATTERN } from "@/lib/minecraft/username";
import { isValidBasketIdent } from "@/lib/tebex/ids";
import type { PendingAdd } from "./action-types";

const PREFIX = isProduction ? "__Host-" : "";

export const BASKET_COOKIE = `${PREFIX}tbnk_basket_ident`;
export const USERNAME_COOKIE = `${PREFIX}tbnk_username`;
export const MOCK_BASKET_COOKIE = `${PREFIX}tbnk_mock_basket`;
export const PENDING_ADD_COOKIE = `${PREFIX}tbnk_pending_add`;

const MAX_AGE = 60 * 60 * 24 * 7;
const MAX_MOCK_BASKET_LENGTH = 3000;
const MAX_PENDING_ADD_LENGTH = 2800;
const MAX_VARIABLE_COUNT = 50;
const MAX_VARIABLE_KEY_LENGTH = 64;
const MAX_VARIABLE_VALUE_LENGTH = 256;
const MAX_RETURN_PATH_LENGTH = 512;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction || isPreview,
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
    priority: "high" as const
  };
}

function sign(value: string): string {
  const signature = createHmac("sha256", cookieSecret)
    .update(value)
    .digest("base64url");
  return `${value}.${signature}`;
}

function unsign(value: string | undefined): string | null {
  if (!value) return null;

  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expected = createHmac("sha256", cookieSecret)
    .update(payload)
    .digest("base64url");

  if (signature.length !== expected.length) return null;

  try {
    if (
      !timingSafeEqual(
        Buffer.from(signature, "utf8"),
        Buffer.from(expected, "utf8")
      )
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return payload;
}

function decodeJson<T>(value: string | null | undefined): T | null {
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

function normalizePendingAdd(value: unknown): PendingAdd | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const packageRef =
    typeof record.packageId === "string" || typeof record.packageId === "number"
      ? String(record.packageId).trim()
      : "";

  if (!packageRef || packageRef.length > 64) return null;

  const quantity = Number(record.quantity);
  if (!Number.isFinite(quantity)) return null;

  let variableData: Record<string, string> | undefined;
  if (record.variableData !== undefined) {
    if (
      !record.variableData ||
      typeof record.variableData !== "object" ||
      Array.isArray(record.variableData)
    ) {
      return null;
    }

    const entries = Object.entries(
      record.variableData as Record<string, unknown>
    );
    if (entries.length > MAX_VARIABLE_COUNT) return null;

    variableData = {};
    for (const [key, rawValue] of entries) {
      if (
        key.length === 0 ||
        key.length > MAX_VARIABLE_KEY_LENGTH ||
        typeof rawValue !== "string" ||
        rawValue.length > MAX_VARIABLE_VALUE_LENGTH
      ) {
        return null;
      }
      variableData[key] = rawValue;
    }
  }

  return {
    packageId: packageRef,
    quantity,
    variableData,
    returnPath: safeRedirectPath(record.returnPath).slice(
      0,
      MAX_RETURN_PATH_LENGTH
    )
  };
}

export async function getUsernameCookie(): Promise<string | null> {
  const store = await cookies();
  const value = unsign(store.get(USERNAME_COOKIE)?.value);
  return value && USERNAME_PATTERN.test(value) ? value : null;
}

export async function setUsernameCookie(username: string): Promise<void> {
  if (!USERNAME_PATTERN.test(username)) {
    throw new Error("Pseudo Minecraft invalide.");
  }

  const store = await cookies();
  store.set(USERNAME_COOKIE, sign(username), cookieOptions());
}

export async function clearUsernameCookie(): Promise<void> {
  const store = await cookies();
  store.delete(USERNAME_COOKIE);
}

export async function getBasketIdentCookie(): Promise<string | null> {
  const store = await cookies();
  const value = unsign(store.get(BASKET_COOKIE)?.value);
  return isValidBasketIdent(value) ? value : null;
}

export async function setBasketIdentCookie(ident: string): Promise<void> {
  if (!isValidBasketIdent(ident)) {
    throw new Error("Identifiant de panier Tebex invalide.");
  }

  const store = await cookies();
  store.set(BASKET_COOKIE, sign(ident), cookieOptions());
}

export async function clearBasketIdentCookie(): Promise<void> {
  const store = await cookies();
  store.delete(BASKET_COOKIE);
}

export async function getMockBasketCookie(): Promise<string | null> {
  const store = await cookies();
  const value = unsign(store.get(MOCK_BASKET_COOKIE)?.value);
  if (!value || value.length > MAX_MOCK_BASKET_LENGTH) return null;
  return value;
}

export async function setMockBasketCookie(value: string): Promise<void> {
  if (value.length > MAX_MOCK_BASKET_LENGTH) {
    throw new Error("Panier de démonstration trop volumineux.");
  }

  const store = await cookies();
  store.set(MOCK_BASKET_COOKIE, sign(value), cookieOptions());
}

export async function clearMockBasketCookie(): Promise<void> {
  const store = await cookies();
  store.delete(MOCK_BASKET_COOKIE);
}

export async function getPendingAddCookie(): Promise<PendingAdd | null> {
  const store = await cookies();
  const payload = unsign(store.get(PENDING_ADD_COOKIE)?.value);
  return normalizePendingAdd(decodeJson<unknown>(payload));
}

export async function setPendingAddCookie(
  pending: PendingAdd
): Promise<void> {
  const normalized = normalizePendingAdd(pending);
  if (!normalized) {
    throw new Error("Pending add invalide.");
  }

  const payload = JSON.stringify(normalized);
  if (payload.length > MAX_PENDING_ADD_LENGTH) {
    throw new Error("Pending add trop volumineux.");
  }

  const store = await cookies();
  store.set(PENDING_ADD_COOKIE, sign(payload), cookieOptions());
}

export async function clearPendingAddCookie(): Promise<void> {
  const store = await cookies();
  store.delete(PENDING_ADD_COOKIE);
}
