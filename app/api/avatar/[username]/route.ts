import { NextResponse } from "next/server";
import { isValidUsername } from "@/lib/minecraft/username";
import { rateLimit } from "@/lib/rate-limit";

const MIN_SIZE = 16;
const MAX_SIZE = 256;
const DEFAULT_SIZE = 144;
const AVATAR_TIMEOUT_MS = 4000;
const CACHE_SECONDS = 60 * 60 * 24;
const STALE_SECONDS = 60 * 60 * 24 * 7;

function parseSize(value: string | null): number | null {
  if (!value) return DEFAULT_SIZE;

  const size = Number(value);
  if (!Number.isInteger(size) || size < MIN_SIZE || size > MAX_SIZE) {
    return null;
  }

  return size;
}

async function fetchAvatar(url: string): Promise<Response | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: CACHE_SECONDS },
      signal: AbortSignal.timeout(AVATAR_TIMEOUT_MS)
    });

    if (
      response.ok &&
      response.headers.get("content-type")?.startsWith("image/")
    ) {
      return response;
    }
  } catch {
    // On tente le fournisseur suivant.
  }

  return null;
}

/**
 * Proxy first-party des avatars Minecraft.
 *
 * Le navigateur ne contacte jamais mc-heads.net : l'image est récupérée et
 * mise en cache côté serveur. Cela évite les requêtes tierces côté visiteur,
 * les blocages CSP/adblock et les limites de débit du fournisseur.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const allowed = await rateLimit("avatar", 120, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes." }, { status: 429 });
  }

  const { username } = await params;
  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: "Pseudo Minecraft invalide." },
      { status: 400 }
    );
  }

  const size = parseSize(new URL(request.url).searchParams.get("size"));
  if (size === null) {
    return NextResponse.json(
      { error: "Taille d'avatar invalide." },
      { status: 400 }
    );
  }

  const encoded = encodeURIComponent(username);
  const upstream =
    (await fetchAvatar(`https://mc-heads.net/avatar/${encoded}/${size}`)) ??
    (await fetchAvatar(`https://minotar.net/helm/${encoded}/${size}.png`));

  if (!upstream) {
    return NextResponse.json(
      { error: "Avatar indisponible." },
      { status: 404 }
    );
  }

  const body = await upstream.arrayBuffer();
  const contentType = upstream.headers.get("content-type") ?? "image/png";

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}`,
      "X-Content-Type-Options": "nosniff"
    }
  });
}
