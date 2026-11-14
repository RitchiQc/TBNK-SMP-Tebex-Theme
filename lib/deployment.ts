export type AppEnv = "development" | "preview" | "production";

function normalizeEnv(value: string | undefined): AppEnv | null {
  const normalized = value?.trim().toLowerCase();
  if (
    normalized === "development" ||
    normalized === "preview" ||
    normalized === "production"
  ) {
    return normalized;
  }
  return null;
}

/**
 * Environnement logique du déploiement.
 *
 * - `APP_ENV` est la source de vérité pour un hôte Node.js.
 * - Sur Vercel, `VERCEL_ENV` distingue production / preview / development,
 *   même si `NODE_ENV` vaut `production` dans les previews.
 * - Par défaut, on considère être en développement pour ne pas exiger les
 *   secrets de production lors d'un build local.
 */
export function getAppEnv(): AppEnv {
  const explicit = normalizeEnv(process.env.APP_ENV);
  if (explicit) return explicit;

  const vercel = normalizeEnv(process.env.VERCEL_ENV);
  if (vercel) return vercel;

  // Un `next start` self-hosted sans APP_ENV/VERCEL_ENV est considéré comme
  // une production : on ne veut pas qu'un serveur de production puisse
  // basculer silencieusement en mode démo. Pendant `next build`, on reste en
  // développement pour permettre un build local sans secrets.
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build"
  ) {
    return "production";
  }

  return "development";
}

export const appEnv = getAppEnv();
export const isProduction = appEnv === "production";
export const isPreview = appEnv === "preview";
export const isDevelopment = appEnv === "development";
