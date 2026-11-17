"use client";

import { useEffect, useState } from "react";

export const CONSENT_COOKIE = "tbnk_consent";
export const CONSENT_VERSION = 2;
export const CONSENT_EVENT = "tbnk:consent";
export const OPEN_CONSENT_EVENT = "tbnk:open-consent";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 183;

export type ConsentState = {
  necessary: true;
  media: boolean;
  version: number;
};

export const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  media: false,
  version: CONSENT_VERSION
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const entry = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return entry ? entry.slice(prefix.length) : null;
}

export function hasConsentChoice(): boolean {
  return readCookie(CONSENT_COOKIE) !== null;
}

export function readConsentCookie(): ConsentState {
  const raw = readCookie(CONSENT_COOKIE);
  if (!raw) return DEFAULT_CONSENT;

  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
    return {
      necessary: true,
      media: parsed.media === true,
      version:
        typeof parsed.version === "number"
          ? parsed.version
          : CONSENT_VERSION
    };
  } catch {
    return DEFAULT_CONSENT;
  }
}

export function saveConsent(next: Omit<ConsentState, "necessary">): void {
  const state: ConsentState = {
    necessary: true,
    media: next.media === true,
    version: CONSENT_VERSION
  };

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:";

  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(
    JSON.stringify(state)
  )}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${
    secure ? "; Secure" : ""
  }`;

  window.dispatchEvent(new Event(CONSENT_EVENT));
}

export function openConsentSettings(): void {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}

export function useConsent(): ConsentState {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);

  useEffect(() => {
    const sync = () => setConsent(readConsentCookie());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  return consent;
}
