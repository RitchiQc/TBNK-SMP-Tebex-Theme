import "server-only";

import { isMockMode, tebexPublicToken } from "@/lib/env";
import { siteConfig } from "@/lib/site";
import { isValidBasketIdent } from "./ids";

const API_BASE =
  process.env.TEBEX_API_BASE?.replace(/\/$/, "") ??
  "https://headless.tebex.io/api";

const PUBLIC_TOKEN = tebexPublicToken;

/**
 * Mode démo : aucun token public Tebex n'est configuré en développement ou en
 * préproduction. En production, `lib/env.ts` fait échouer le démarrage si le
 * token manque.
 */
export { isMockMode };

export class TebexError extends Error {
  readonly status: number;
  readonly detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = "TebexError";
    this.status = status;
    this.detail = detail;
  }
}

function accountUrl(path: string): string {
  if (!PUBLIC_TOKEN) {
    throw new Error("TEBEX_PUBLIC_TOKEN is not configured");
  }
  return `${API_BASE}/accounts/${encodeURIComponent(PUBLIC_TOKEN)}${path}`;
}

function bareBasketUrl(ident: string, path: string): string {
  return `${API_BASE}/baskets/${encodeURIComponent(ident)}${path}`;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  revalidate?: number;
  notFound?: number[];
};

function extractDetail(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  const detail = record.detail ?? record.message ?? record.title;
  return typeof detail === "string" && detail.trim().length > 0
    ? detail.trim()
    : undefined;
}

async function request<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T | null> {
  const {
    method = "GET",
    body,
    revalidate,
    notFound = []
  } = options;

  const headers: Record<string, string> = {
    Accept: "application/json"
  };

  const init: RequestInit & { next?: { revalidate: number } } = {
    method,
    headers,
    signal: AbortSignal.timeout(8000)
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  if (revalidate !== undefined) {
    init.next = { revalidate };
  } else {
    init.cache = "no-store";
  }

  const response = await fetch(url, init);

  if (notFound.includes(response.status)) {
    return null;
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => undefined);
    const detail = extractDetail(payload);
    throw new TebexError(
      detail ?? `Tebex API error (${response.status})`,
      response.status,
      detail
    );
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new TebexError(
      "Tebex a retourné une réponse illisible.",
      response.status
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Catalogue                                                                  */
/* -------------------------------------------------------------------------- */

export async function getWebstoreRaw(): Promise<unknown | null> {
  return request(accountUrl("/"), { revalidate: 300, notFound: [404] });
}

export async function getCategoriesRaw(): Promise<unknown | null> {
  return request(accountUrl("/categories?includePackages=1"), {
    revalidate: 300,
    notFound: [404]
  });
}

export async function getPackageRaw(id: number): Promise<unknown | null> {
  return request(accountUrl(`/packages/${encodeURIComponent(String(id))}`), {
    revalidate: 300,
    notFound: [400, 404, 422]
  });
}

/* -------------------------------------------------------------------------- */
/* Panier                                                                      */
/* -------------------------------------------------------------------------- */

export async function createBasketRaw(
  username?: string
): Promise<unknown | null> {
  return request(accountUrl("/baskets"), {
    method: "POST",
    body: {
      ...(username ? { username } : {}),
      complete_url: `${siteConfig.url}/api/checkout/success`,
      cancel_url: `${siteConfig.url}/cart`,
      complete_auto_redirect: true
    }
  });
}

export async function getBasketRaw(
  ident: string
): Promise<unknown | null> {
  if (!isValidBasketIdent(ident)) return null;

  return request(accountUrl(`/baskets/${encodeURIComponent(ident)}`), {
    notFound: [404]
  });
}

export async function getBasketAuthProvidersRaw(
  ident: string,
  returnUrl: string
): Promise<unknown | null> {
  if (!isValidBasketIdent(ident)) return null;

  return request(
    accountUrl(
      `/baskets/${encodeURIComponent(ident)}/auth?returnUrl=${encodeURIComponent(
        returnUrl
      )}`
    ),
    { notFound: [404] }
  );
}

/**
 * Les endpoints d'ajout/suppression/quantité du panier vivent à la racine
 * de l'API (sans `/accounts/{token}`), contrairement au reste de l'API.
 * C'est le comportement confirmé sur une boutique réelle.
 */
export async function addPackageRaw(
  ident: string,
  packageRef: string | number,
  quantity: number,
  variableData?: Record<string, string>
): Promise<unknown | null> {
  return request(bareBasketUrl(ident, "/packages"), {
    method: "POST",
    body: {
      package_id: String(packageRef),
      quantity,
      ...(variableData && Object.keys(variableData).length > 0
        ? { variable_data: variableData }
        : {})
    }
  });
}

export async function updatePackageQuantityRaw(
  ident: string,
  packageRef: string | number,
  quantity: number
): Promise<unknown | null> {
  return request(
    bareBasketUrl(
      ident,
      `/packages/${encodeURIComponent(String(packageRef))}`
    ),
    {
      method: "PUT",
      body: { quantity }
    }
  );
}

export async function removePackageRaw(
  ident: string,
  packageRef: string | number
): Promise<unknown | null> {
  return request(bareBasketUrl(ident, "/packages/remove"), {
    method: "POST",
    body: { package_id: String(packageRef) }
  });
}

/* -------------------------------------------------------------------------- */
/* Codes promo / cartes cadeaux                                               */
/* -------------------------------------------------------------------------- */

export async function applyCouponRaw(
  ident: string,
  code: string
): Promise<unknown | null> {
  return request(accountUrl(`/baskets/${encodeURIComponent(ident)}/coupons`), {
    method: "POST",
    body: { coupon_code: code }
  });
}

export async function removeCouponRaw(
  ident: string,
  code: string
): Promise<unknown | null> {
  return request(
    accountUrl(`/baskets/${encodeURIComponent(ident)}/coupons/remove`),
    {
      method: "POST",
      body: { coupon_code: code }
    }
  );
}

export async function applyGiftCardRaw(
  ident: string,
  cardNumber: string
): Promise<unknown | null> {
  return request(
    accountUrl(`/baskets/${encodeURIComponent(ident)}/giftcards`),
    {
      method: "POST",
      body: { card_number: cardNumber }
    }
  );
}

export async function removeGiftCardRaw(
  ident: string,
  cardNumber: string
): Promise<unknown | null> {
  return request(
    accountUrl(`/baskets/${encodeURIComponent(ident)}/giftcards/remove`),
    {
      method: "POST",
      body: { card_number: cardNumber }
    }
  );
}
