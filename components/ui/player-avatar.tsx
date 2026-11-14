"use client";

import { useState } from "react";
import { initials } from "@/lib/format";

export function PlayerAvatar({
  username,
  size = 38,
  className = ""
}: {
  username: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!username || failed) {
    return (
      <span
        className={`avatar ${className}`}
        style={{
          width: size,
          height: size,
          display: "inline-grid",
          placeItems: "center",
          color: "var(--accent-light)",
          fontSize: Math.max(10, size * 0.3),
          fontWeight: 900
        }}
        aria-hidden="true"
      >
        {initials(username)}
      </span>
    );
  }

  return (
    <img
      className={`avatar ${className}`}
      style={{ width: size, height: size }}
      src={`https://mc-heads.net/avatar/${encodeURIComponent(username)}/${size * 2}`}
      alt={`Avatar de ${username}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
