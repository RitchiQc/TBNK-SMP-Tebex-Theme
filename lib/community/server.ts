import { cache } from "react";
import { siteConfig } from "@/lib/site";
import type { ServerStatus } from "@/lib/tebex/types";

const OFFLINE: ServerStatus = {
  online: false,
  players: { online: 0, max: 0 },
  version: null,
  motd: null
};

function cleanMotd(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const clean = record.clean;
  if (Array.isArray(clean)) {
    const text = clean.filter((line) => typeof line === "string").join(" ");
    return text.trim() || null;
  }
  return typeof clean === "string" && clean.trim() ? clean.trim() : null;
}

export const getServerStatus = cache(async (): Promise<ServerStatus> => {
  try {
    const response = await fetch(
      `https://api.mcsrvstat.us/3/${encodeURIComponent(siteConfig.javaIp)}`,
      {
        next: { revalidate: 60 },
        headers: {
          Accept: "application/json",
          "User-Agent": "TBNK-SMP-Storefront/1.0"
        }
      }
    );

    if (!response.ok) return OFFLINE;

    const payload = (await response.json()) as unknown;
    if (!payload || typeof payload !== "object") return OFFLINE;

    const record = payload as Record<string, unknown>;
    const players =
      record.players && typeof record.players === "object"
        ? (record.players as Record<string, unknown>)
        : {};
    const version =
      typeof record.version === "string"
        ? record.version
        : record.version && typeof record.version === "object"
          ? String(
              (record.version as Record<string, unknown>).name ?? ""
            ).trim() || null
          : null;

    return {
      online: record.online === true,
      players: {
        online: Number(players.online) || 0,
        max: Number(players.max) || 0
      },
      version,
      motd: cleanMotd(record.motd)
    };
  } catch {
    return OFFLINE;
  }
});
