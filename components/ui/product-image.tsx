"use client";

import { useEffect, useState } from "react";

const PLACEHOLDER = "/images/package-placeholder.svg";

type ProductImageProps = {
  src: string | null | undefined;
  pkg: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
  fallback?: string;
};

function isRemoteImage(value: string | null | undefined): value is string {
  return typeof value === "string" && /^https:\/\//i.test(value);
}

export function tebexImageProxyUrl(
  src: string | null | undefined,
  pkg: string
): string | null {
  const params = new URLSearchParams();
  if (isRemoteImage(src)) params.set("src", src);
  if (pkg) params.set("pkg", pkg);

  const query = params.toString();
  return query ? `/api/image?${query}` : null;
}

/**
 * Image de package avec chaîne de repli :
 * proxy first-party → CDN Tebex direct → placeholder.
 *
 * Le proxy est rendu dès le SSR : l'image se charge donc même si le navigateur
 * bloque le CDN ou si le JS n'a pas encore hydraté. Le CDN direct reste tenté
 * en second pour ne pas dépendre uniquement du serveur.
 */
export function ProductImage({
  src,
  pkg,
  alt,
  className,
  loading,
  fallback = PLACEHOLDER
}: ProductImageProps) {
  const proxy =
    isRemoteImage(src) || !src ? tebexImageProxyUrl(src, pkg) : null;

  const candidates: string[] = [];
  if (proxy) candidates.push(proxy);
  if (src && !candidates.includes(src)) candidates.push(src);
  if (!candidates.includes(fallback)) candidates.push(fallback);

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setAttempt(0);
  }, [src, pkg, fallback]);

  const current = candidates[Math.min(attempt, candidates.length - 1)];

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading={loading}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        setAttempt((value) =>
          value < candidates.length - 1 ? value + 1 : value
        );
      }}
    />
  );
}
