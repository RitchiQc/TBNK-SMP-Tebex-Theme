import { NextResponse } from "next/server";
import { isValidUsername } from "@/lib/minecraft/username";
import { rateLimit } from "@/lib/rate-limit";

const MIN_SIZE = 16;
const MAX_SIZE = 256;
const DEFAULT_SIZE = 144;
const AVATAR_TIMEOUT_MS = 4000;
const CACHE_SECONDS = 60 * 60 * 24;
const STALE_SECONDS = 60 * 60 * 24 * 7;

const PROFILE_LOOKUPS = [
  "https://api.minecraftservices.com/minecraft/profile/lookup/name",
  "https://api.mojang.com/users/profiles/minecraft"
];

type MinecraftProfile = {
  id: string;
  name: string;
};

function parseSize(value: string | null): number | null {
  if (!value) return DEFAULT_SIZE;

  const size = Number(value);
  if (!Number.isInteger(size) || size < MIN_SIZE || size > MAX_SIZE) {
    return null;
  }

  return size;
}

async function resolveProfile(
  username: string
): Promise<MinecraftProfile | null> {
  for (const base of PROFILE_LOOKUPS) {
    try {
      const response = await fetch(`${base}/${encodeURIComponent(username)}`, {
        next: { revalidate: CACHE_SECONDS },
        signal: AbortSignal.timeout(AVATAR_TIMEOUT_MS)
      });

      if (response.status === 404 || response.status === 204) {
        continue;
      }

      if (!response.ok) continue;

      const data = (await response.json()) as Record<string, unknown>;
      if (typeof data.id !== "string" || typeof data.name !== "string") {
        continue;
      }

      const id = data.id.replace(/-/g, "").toLowerCase();
      if (!/^[0-9a-f]{32}$/.test(id)) continue;

      return { id, name: data.name };
    } catch {
      // Essaie l'API suivante.
    }
  }

  return null;
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
 * Le pseudo est d'abord résolu en UUID via les API Mojang/Microsoft, puis
 * l'image est récupérée côté serveur. Minotar est utilisé en priorité avec
 * l'UUID : son cache par pseudo est sensible à la casse et peut renvoyer une
 * tête Steve pour un pseudo valide. Les comptes inexistants renvoient 404 afin
 * que le client affiche les initiales plutôt qu'un faux avatar.
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

  const profile = await resolveProfile(username);
  if (!profile) {
    return NextResponse.json(
      { error: "Compte Minecraft introuvable." },
      { status: 404 }
    );
  }

  const candidates = [
    {
      source: "minotar-uuid",
      url: `https://minotar.net/helm/${profile.id}/${size}.png`
    },
    {
      source: "mc-heads-uuid",
      url: `https://mc-heads.net/avatar/${profile.id}/${size}`
    },
    {
      source: "mc-heads-name",
      url: `https://mc-heads.net/avatar/${encodeURIComponent(profile.name)}/${size}`
    }
  ];

  for (const candidate of candidates) {
    const upstream = await fetchAvatar(candidate.url);
    if (!upstream) continue;

    const body = await upstream.arrayBuffer();
    const contentType = upstream.headers.get("content-type") ?? "image/png";

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `public, max-age=${CACHE_SECONDS}, stale-while-revalidate=${STALE_SECONDS}`,
        "X-Content-Type-Options": "nosniff",
        "X-Avatar-Source": candidate.source
      }
    });
  }

  return NextResponse.json(
    { error: "Avatar indisponible." },
    { status: 404 }
  );
}

