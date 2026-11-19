import "server-only";

import { getPackageRawFresh } from "./client";
import { mapPackage } from "./mapper";
import { isAllowedTebexAssetUrl } from "./urls";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_CACHE_ENTRIES = 48;
const MAX_CACHE_BYTES = 64 * 1024 * 1024;
const DIRECT_TTL_MS = 24 * 60 * 60 * 1000;
const FRESH_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

type ImageSource = "direct" | "fresh";

type CachedImage = {
  body: ArrayBuffer;
  contentType: string;
  expiresAt: number;
  source: ImageSource;
};

export type ProxyImage = CachedImage & {
  cacheControl: string;
};

const cache = new Map<string, CachedImage>();
let cacheBytes = 0;

function prune(now: number): void {
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) {
      cacheBytes -= entry.body.byteLength;
      cache.delete(key);
    }
  }

  while (cache.size >= MAX_CACHE_ENTRIES || cacheBytes >= MAX_CACHE_BYTES) {
    const oldest = cache.keys().next().value;
    if (!oldest) break;
    const entry = cache.get(oldest);
    if (!entry) break;
    cacheBytes -= entry.body.byteLength;
    cache.delete(oldest);
  }
}

function readCached(key: string): CachedImage | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    cacheBytes -= entry.body.byteLength;
    cache.delete(key);
    return null;
  }

  return entry;
}

function writeCached(key: string, entry: CachedImage): void {
  const existing = cache.get(key);
  if (existing) {
    cacheBytes -= existing.body.byteLength;
    cache.delete(key);
  }

  cache.set(key, entry);
  cacheBytes += entry.body.byteLength;
  prune(Date.now());
}

function toProxyImage(entry: CachedImage): ProxyImage {
  const maxAge = entry.source === "direct" ? 86400 : 300;
  const stale = entry.source === "direct" ? 604800 : 60;

  return {
    ...entry,
    cacheControl: `public, max-age=${maxAge}, stale-while-revalidate=${stale}`
  };
}

async function fetchRemoteImage(
  url: string
): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  if (!isAllowedTebexAssetUrl(url)) return null;

  try {
    const response = await fetch(url, {
      headers: { Accept: "image/*" },
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    });

    if (!response.ok) return null;
    if (!isAllowedTebexAssetUrl(response.url)) return null;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith("image/")) return null;

    const declaredLength = Number(response.headers.get("content-length") ?? "0");
    if (Number.isFinite(declaredLength) && declaredLength > MAX_IMAGE_BYTES) {
      return null;
    }

    const body = await response.arrayBuffer();
    if (body.byteLength === 0 || body.byteLength > MAX_IMAGE_BYTES) return null;

    return { body, contentType };
  } catch {
    return null;
  }
}

function unwrapData(raw: unknown): unknown {
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

async function resolveFreshPackageImage(ref: string): Promise<string | null> {
  try {
    const raw = await getPackageRawFresh(ref);
    if (!raw) return null;

    const data = unwrapData(raw);
    const source = Array.isArray(data) ? data[0] : data;
    if (!source || typeof source !== "object") return null;

    return mapPackage(source, { id: 0, name: "", slug: "" }).image;
  } catch {
    return null;
  }
}

/**
 * Résout une image Tebex côté serveur.
 *
 * L'URL fournie par le catalogue est tentée d'abord. Si elle ne répond plus
 * (image remplacée dans Tebex, cache de catalogue périmé), le package est
 * relu sans cache pour retrouver l'image actuelle. Le résultat est mis en
 * cache mémoire et renvoyé avec un Cache-Control adapté.
 */
export async function resolveImage({
  src,
  pkg
}: {
  src: string | null;
  pkg: string | null;
}): Promise<ProxyImage | null> {
  const sourceUrl = src && isAllowedTebexAssetUrl(src) ? src : null;

  if (sourceUrl) {
    const cached = readCached(`url:${sourceUrl}`);
    if (cached) return toProxyImage(cached);

    const image = await fetchRemoteImage(sourceUrl);
    if (image) {
      const entry: CachedImage = {
        ...image,
        expiresAt: Date.now() + DIRECT_TTL_MS,
        source: "direct"
      };
      writeCached(`url:${sourceUrl}`, entry);
      return toProxyImage(entry);
    }
  }

  if (!pkg) return null;

  const cached = readCached(`pkg:${pkg}`);
  if (cached) return toProxyImage(cached);

  const freshUrl = await resolveFreshPackageImage(pkg);
  if (!freshUrl) return null;

  const image = await fetchRemoteImage(freshUrl);
  if (!image) return null;

  const entry: CachedImage = {
    ...image,
    expiresAt: Date.now() + FRESH_TTL_MS,
    source: "fresh"
  };

  writeCached(`pkg:${pkg}`, entry);
  if (sourceUrl) writeCached(`url:${sourceUrl}`, entry);

  return toProxyImage(entry);
}
