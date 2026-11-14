import "server-only";

import { appEnv, isPreview, isProduction } from "./deployment";

const PUBLIC_TOKEN = process.env.TEBEX_PUBLIC_TOKEN?.trim() ?? "";
const RAW_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
const API_BASE = process.env.TEBEX_API_BASE?.trim() ?? "";
const COOKIE_SECRET = process.env.COOKIE_SECRET?.trim() ?? "";
const ALLOW_DEMO = process.env.ALLOW_DEMO === "true";

const errors: string[] = [];

function isPublicHttpsOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.username.length === 0 &&
      url.password.length === 0 &&
      url.search.length === 0 &&
      url.hash.length === 0 &&
      (url.pathname === "/" || url.pathname.length === 0) &&
      !["localhost", "127.0.0.1", "::1"].includes(url.hostname.toLowerCase())
    );
  } catch {
    return false;
  }
}

if (isProduction) {
  if (!PUBLIC_TOKEN) {
    errors.push(
      "TEBEX_PUBLIC_TOKEN est obligatoire en production. Le mode démo est réservé au développement et à la préproduction."
    );
  }

  if (!RAW_SITE_URL || !isPublicHttpsOrigin(RAW_SITE_URL)) {
    errors.push(
      "NEXT_PUBLIC_SITE_URL doit être une origine HTTPS publique (par ex. https://tbnk-smp.com), sans chemin, credentials, query ni hash."
    );
  }

  if (COOKIE_SECRET.length < 32) {
    errors.push(
      "COOKIE_SECRET est obligatoire en production et doit contenir au moins 32 caractères."
    );
  }

  if (ALLOW_DEMO) {
    errors.push(
      "ALLOW_DEMO=true est interdit en production. Utilise APP_ENV=preview pour un environnement de démonstration."
    );
  }

  const requiredLegalFields: Array<[string, string]> = [
    ["NEXT_PUBLIC_LEGAL_NAME", process.env.NEXT_PUBLIC_LEGAL_NAME ?? ""],
    ["NEXT_PUBLIC_LEGAL_ADDRESS", process.env.NEXT_PUBLIC_LEGAL_ADDRESS ?? ""],
    ["NEXT_PUBLIC_LEGAL_PHONE", process.env.NEXT_PUBLIC_LEGAL_PHONE ?? ""],
    ["NEXT_PUBLIC_SUPPORT_EMAIL", process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? ""],
    ["NEXT_PUBLIC_PRIVACY_EMAIL", process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? ""],
    ["NEXT_PUBLIC_PRIVACY_OFFICER", process.env.NEXT_PUBLIC_PRIVACY_OFFICER ?? ""]
  ];

  for (const [key, value] of requiredLegalFields) {
    if (!value.trim()) {
      errors.push(
        `${key} est obligatoire en production (identité légale et contacts Loi 25 / LPC).`
      );
    }
  }
}

if (isPreview && PUBLIC_TOKEN && !isPublicHttpsOrigin(RAW_SITE_URL)) {
  errors.push(
    "En préproduction avec un token Tebex, NEXT_PUBLIC_SITE_URL doit être une origine HTTPS (URL de preview)."
  );
}

if (API_BASE) {
  try {
    const apiUrl = new URL(API_BASE);
    if (apiUrl.protocol !== "https:") {
      errors.push("TEBEX_API_BASE doit utiliser HTTPS.");
    }
    if (apiUrl.username || apiUrl.password || apiUrl.search || apiUrl.hash) {
      errors.push(
        "TEBEX_API_BASE ne doit pas contenir de credentials, query ni hash."
      );
    }
  } catch {
    errors.push("TEBEX_API_BASE n'est pas une URL valide.");
  }
}

if (errors.length > 0) {
  throw new Error(
    `[env] Configuration invalide pour APP_ENV=${appEnv} :\n- ${errors.join("\n- ")}`
  );
}

if (
  !COOKIE_SECRET &&
  !isProduction &&
  process.env.NODE_ENV === "development"
) {
  console.warn(
    "[env] COOKIE_SECRET absent : un secret de développement non sécurisé est utilisé pour signer les cookies."
  );
}

/**
 * Mode démo : aucun token public Tebex.
 * En production, l'absence de token lève une erreur ci-dessus.
 * En preview, l'absence de token active automatiquement la démo.
 */
export const isMockMode = PUBLIC_TOKEN.length === 0;

export const tebexPublicToken = PUBLIC_TOKEN;

export const cookieSecret =
  COOKIE_SECRET ||
  (isProduction ? "" : "tbnk-development-cookie-secret-change-me");

/**
 * Sur Vercel, la plateforme injecte `x-forwarded-for`. En self-hosted, il faut
 * explicitement faire confiance au proxy via TRUST_PROXY=true.
 */
export const trustProxy =
  process.env.TRUST_PROXY === "true" || process.env.VERCEL === "1";

export { appEnv, isPreview, isProduction };
