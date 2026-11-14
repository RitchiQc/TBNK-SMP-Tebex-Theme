import { cache } from "react";
import { siteConfig } from "@/lib/site";
import type { DiscordStats } from "@/lib/tebex/types";

const FALLBACK: DiscordStats = {
  name: siteConfig.name,
  members: siteConfig.discordFallbackMembers,
  online: siteConfig.discordFallbackOnline,
  iconUrl: null,
  inviteUrl: siteConfig.discordUrl
};

export const getDiscordStats = cache(async (): Promise<DiscordStats> => {
  try {
    const response = await fetch(
      `https://discord.com/api/v9/invites/${encodeURIComponent(
        siteConfig.discordInviteCode
      )}?with_counts=true&with_expiration=true`,
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(4000),
        headers: {
          Accept: "application/json",
          "User-Agent": "TBNK-SMP-Storefront/1.0"
        }
      }
    );

    if (!response.ok) return FALLBACK;

    const payload = (await response.json()) as unknown;
    if (!payload || typeof payload !== "object") return FALLBACK;

    const record = payload as Record<string, unknown>;
    const guild =
      record.guild && typeof record.guild === "object"
        ? (record.guild as Record<string, unknown>)
        : {};
    const guildId =
      typeof guild.id === "string" ? guild.id : siteConfig.discordGuildId;
    const icon =
      typeof guild.icon === "string" && guild.icon.length > 0
        ? guild.icon
        : null;

    return {
      name:
        typeof guild.name === "string" && guild.name.trim().length > 0
          ? guild.name.trim()
          : FALLBACK.name,
      members:
        Number(record.approximate_member_count) || FALLBACK.members,
      online:
        Number(record.approximate_presence_count) || FALLBACK.online,
      iconUrl: icon
        ? `https://cdn.discordapp.com/icons/${guildId}/${icon}.png?size=128`
        : null,
      inviteUrl: siteConfig.discordUrl
    };
  } catch {
    return FALLBACK;
  }
});
