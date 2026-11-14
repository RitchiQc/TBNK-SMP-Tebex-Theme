import "server-only";

import { headers } from "next/headers";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

function cleanup(now: number): void {
  if (buckets.size < MAX_BUCKETS) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }

  while (buckets.size >= MAX_BUCKETS) {
    const oldest = buckets.keys().next().value;
    if (!oldest) break;
    buckets.delete(oldest);
  }
}

/**
 * Limiteur best-effort par IP pour les Server Actions.
 *
 * En production sur Vercel, ce compteur est local à chaque instance : il ne
 * remplace pas un rate limit distribué (Vercel WAF, Upstash Redis, etc.).
 * Il bloque néanmoins les rafales les plus évidentes en self-hosted ou sur
 * une instance unique.
 */
export async function rateLimit(
  scope: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  let ip = "unknown";

  try {
    const store = await headers();
    const forwarded =
      store.get("x-forwarded-for") ?? store.get("x-real-ip") ?? "unknown";
    ip = forwarded.split(",")[0]?.trim() || "unknown";
  } catch {
    // Pas de contexte de requête : on laisse passer.
  }

  const key = `${scope}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    cleanup(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}