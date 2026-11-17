"use client";

import { useEffect, useState } from "react";
import { initials } from "@/lib/format";

const AVATAR_VERSION = 2;

export function PlayerAvatar({
  username,
  size = 38,
  className = "",
  priority = false
}: {
  username: string | null | undefined;
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setFailed(false);
    setAttempt(0);
  }, [username]);

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

  const retry = attempt > 0 ? `&retry=${attempt}` : "";

  return (
    <img
      className={`avatar ${className}`}
      style={{ width: size, height: size }}
      src={`/api/avatar/${encodeURIComponent(username)}?size=${size * 2}&v=${AVATAR_VERSION}${retry}`}
      alt={`Avatar de ${username}`}
      width={size}
      height={size}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (attempt < 1) {
          setAttempt((value) => value + 1);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
