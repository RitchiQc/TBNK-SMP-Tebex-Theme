import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { resolveImage } from "@/lib/tebex/image-proxy";

const MAX_URL_LENGTH = 2048;
const MAX_REF_LENGTH = 128;
const PACKAGE_REF_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

/**
 * Proxy first-party des images de packages Tebex.
 *
 * Le navigateur ne contacte plus directement le CDN Tebex : il charge une URL
 * `/api/image` same-origin, ce qui évite les blocages CSP/extension/antivirus
 * et permet de remplacer une URL de média périmée par l'image actuelle du
 * package. Seuls les hôtes Tebex sont autorisés (pas de SSRF).
 */
export async function GET(request: Request) {
  const allowed = await rateLimit("tebex-image", 600, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 });
  }

  const params = new URL(request.url).searchParams;
  const src = params.get("src")?.trim() ?? "";
  const pkg = params.get("pkg")?.trim() ?? "";

  if (src.length > MAX_URL_LENGTH || pkg.length > MAX_REF_LENGTH) {
    return NextResponse.json(
      { error: "Paramètres invalides." },
      { status: 400 }
    );
  }

  if (pkg && !PACKAGE_REF_PATTERN.test(pkg)) {
    return NextResponse.json(
      { error: "Référence de package invalide." },
      { status: 400 }
    );
  }

  if (!src && !pkg) {
    return NextResponse.json({ error: "Image manquante." }, { status: 400 });
  }

  const image = await resolveImage({
    src: src || null,
    pkg: pkg || null
  });

  if (!image) {
    return NextResponse.json(
      { error: "Image indisponible." },
      { status: 404 }
    );
  }

  return new NextResponse(image.body, {
    status: 200,
    headers: {
      "Content-Type": image.contentType,
      "Content-Length": String(image.body.byteLength),
      "Cache-Control": image.cacheControl,
      "X-Content-Type-Options": "nosniff",
      "X-Tebex-Image-Source": image.source
    }
  });
}
