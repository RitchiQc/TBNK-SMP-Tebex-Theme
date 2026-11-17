"use client";

import { useState } from "react";
import {
  CONSENT_VERSION,
  saveConsent,
  useConsent
} from "@/lib/consent-client";
import type { PackageMedia } from "@/lib/tebex/types";
import { Icon } from "@/components/ui/icons";

function youtubeEmbed(url: string): string | null {
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

  if (/^[A-Za-z0-9_-]{8,20}$/.test(url)) {
    return `https://www.youtube.com/embed/${url}`;
  }

  return null;
}

export function PackageGallery({
  media,
  name,
  fallback
}: {
  media: PackageMedia[];
  name: string;
  fallback: string;
}) {
  const items: PackageMedia[] =
    media.length > 0
      ? media
      : [
          {
            type: "image",
            url: fallback,
            name: null,
            primary: true,
            featured: false
          }
        ];
  const [activeIndex, setActiveIndex] = useState(0);
  const consent = useConsent();
  const current = items[Math.min(activeIndex, items.length - 1)];
  const embed = current.type === "video" ? youtubeEmbed(current.url) : null;

  function allowMedia(): void {
    saveConsent({
      media: true,
      version: CONSENT_VERSION
    });
  }

  return (
    <div className="gallery">
      <div className="gallery__main">
        {current.type === "video" ? (
          !consent.media ? (
            <div className="gallery__consent">
              <p>
                Cette vidéo est hébergée par YouTube. En la lisant, tu acceptes
                le chargement de YouTube et de ses témoins.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={allowMedia}
              >
                <Icon name="play" size={15} />
                Lire la vidéo
              </button>
            </div>
          ) : embed ? (
            <iframe
              src={embed.replace(
                "https://www.youtube.com/",
                "https://www.youtube-nocookie.com/"
              )}
              title={current.name ?? name}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video src={current.url} controls playsInline preload="metadata" />
          )
        ) : (
          <img
            src={current.url || fallback}
            alt={name}
            decoding="async"
            loading="eager"
          />
        )}
      </div>

      {items.length > 1 ? (
        <div className="gallery__thumbs" aria-label="Médias du package">
          {items.map((item, index) => (
            <button
              key={`${item.url}-${index}`}
              type="button"
              className={`gallery__thumb${index === activeIndex ? " is-active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Voir le média ${index + 1}`}
            >
              {item.type === "image" ? (
                <img src={item.url} alt="" loading="lazy" decoding="async" />
              ) : (
                <span
                  style={{
                    display: "grid",
                    height: "100%",
                    placeItems: "center",
                    color: "var(--accent-light)"
                  }}
                >
                  <Icon name="play" size={18} />
                </span>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
