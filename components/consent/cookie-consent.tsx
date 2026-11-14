"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CONSENT_EVENT,
  CONSENT_VERSION,
  OPEN_CONSENT_EVENT,
  hasConsentChoice,
  readConsentCookie,
  saveConsent
} from "@/lib/consent-client";

export function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [media, setMedia] = useState(false);
  const [avatars, setAvatars] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      const current = readConsentCookie();
      setMedia(current.media);
      setAvatars(current.avatars);
    };

    const onOpen = () => {
      sync();
      setDetails(true);
      setOpen(true);
    };

    const onConsent = () => {
      sync();
      if (hasConsentChoice()) setOpen(false);
    };

    sync();
    setOpen(!hasConsentChoice());

    window.addEventListener(OPEN_CONSENT_EVENT, onOpen);
    window.addEventListener(CONSENT_EVENT, onConsent);

    return () => {
      window.removeEventListener(OPEN_CONSENT_EVENT, onOpen);
      window.removeEventListener(CONSENT_EVENT, onConsent);
    };
  }, []);

  useEffect(() => {
    if (open) regionRef.current?.focus();
  }, [open]);

  function persist(nextMedia: boolean, nextAvatars: boolean): void {
    saveConsent({
      media: nextMedia,
      avatars: nextAvatars,
      version: CONSENT_VERSION
    });
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      ref={regionRef}
      className="cookie-consent"
      role="region"
      aria-labelledby="cookie-consent-title"
      tabIndex={-1}
    >
      <div className="cookie-consent__header">
        <h2 id="cookie-consent-title">Tes préférences de confidentialité</h2>
        <p>
          Les témoins nécessaires font fonctionner le panier. Les contenus
          tiers (YouTube, avatars mc-heads) restent désactivés tant que tu ne
          les acceptes pas.
        </p>
      </div>

      {details ? (
        <div className="cookie-consent__details">
          <label className="cookie-consent__option">
            <input type="checkbox" checked disabled readOnly />
            <span>
              <b>Nécessaires</b>
              <small>Panier, pseudo, sécurité. Toujours actifs.</small>
            </span>
          </label>
          <label className="cookie-consent__option">
            <input
              type="checkbox"
              checked={media}
              onChange={(event) => setMedia(event.target.checked)}
            />
            <span>
              <b>Vidéos YouTube</b>
              <small>Lecture des vidéos de présentation via YouTube.</small>
            </span>
          </label>
          <label className="cookie-consent__option">
            <input
              type="checkbox"
              checked={avatars}
              onChange={(event) => setAvatars(event.target.checked)}
            />
            <span>
              <b>Avatars Minecraft</b>
              <small>Chargement des avatars via mc-heads.net.</small>
            </span>
          </label>
        </div>
      ) : null}

      <div className="cookie-consent__actions">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => persist(false, false)}
        >
          Tout refuser
        </button>
        {details ? (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => persist(media, avatars)}
          >
            Enregistrer mes choix
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setDetails(true)}
          >
            Personnaliser
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => persist(true, true)}
        >
          Tout accepter
        </button>
      </div>

      <p className="cookie-consent__footer">
        <Link href="/legal/privacy#cookies">Politique de confidentialité</Link>
        {" · "}
        Tu peux modifier ton choix à tout moment via « Gérer mes cookies ».
      </p>
    </div>
  );
}
