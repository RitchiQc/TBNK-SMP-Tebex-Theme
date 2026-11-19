const TEBEX_ROOT_DOMAINS = ["tebex.io", "tebex.com"] as const;

/**
 * Hôtes CDN utilisés par Tebex pour les images de packages.
 * La distribution CloudFront est celle documentée par l'API Headless.
 */
const TEBEX_ASSET_HOSTS = ["dunb17ur4ymx4.cloudfront.net"] as const;

/**
 * Vérifie qu'une URL est bien une URL HTTPS.
 */
export function isHttpsUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Vérifie qu'une URL HTTPS appartient à Tebex.
 *
 * Cette allowlist est volontairement stricte : un lien de checkout ou
 * d'authentification renvoyé par l'API ne doit jamais pouvoir rediriger vers un
 * domaine arbitraire.
 */
export function isAllowedTebexUrl(
  value: string | null | undefined
): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;

    const hostname = url.hostname.toLowerCase();
    return TEBEX_ROOT_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

/**
 * Les médias Tebex (images, vidéos) doivent au minimum être servis en HTTPS
 * pour éviter le contenu mixte. On garde une allowlist large pour les CDN
 * Tebex, mais on n'accepte pas de schéma exotique.
 */
export function isAllowedTebexAssetUrl(
  value: string | null | undefined
): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;

    const hostname = url.hostname.toLowerCase();
    return (
      hostname === "tebex.io" ||
      hostname.endsWith(".tebex.io") ||
      hostname === "tebexcdn.com" ||
      hostname.endsWith(".tebexcdn.com") ||
      hostname === "tebex.com" ||
      hostname.endsWith(".tebex.com") ||
      (TEBEX_ASSET_HOSTS as readonly string[]).includes(hostname)
    );
  } catch {
    return false;
  }
}
