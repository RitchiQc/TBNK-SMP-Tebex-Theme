"use client";

import { openConsentSettings } from "@/lib/consent-client";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="footer-cookie-button"
      onClick={openConsentSettings}
    >
      Gérer mes cookies
    </button>
  );
}
