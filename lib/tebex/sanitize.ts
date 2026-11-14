import "server-only";

import sanitizeHtml from "sanitize-html";

const INTERNAL_ORIGIN = "https://internal.invalid";

/**
 * Vérifie qu'un lien ou une image ne peut pas sortir vers un domaine externe
 * via une écriture relative ambiguë (`/\evil.com`, tabulations, etc.).
 */
function isSafeUrl(value: string, allowedProtocols: string[]): boolean {
  const trimmed = value.trim();
  if (!trimmed || /[\\\u0000-\u001F\u007F]/.test(trimmed)) {
    return false;
  }
  if (trimmed.startsWith("//")) {
    return false;
  }

  try {
    // Une URL sans schéma explicite doit rester sur l'origine interne.
    // `/\evil.com` est sans schéma mais le parseur le transforme en
    // `https://evil.com` : on compare donc l'origine résolue.
    if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
      const relative = new URL(trimmed, INTERNAL_ORIGIN);
      return relative.origin === INTERNAL_ORIGIN;
    }

    const absolute = new URL(trimmed);
    return allowedProtocols.includes(absolute.protocol);
  } catch {
    return false;
  }
}

const DESCRIPTION_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "ul",
    "ol",
    "li",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "code",
    "pre",
    "a",
    "span",
    "img"
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "loading"],
    span: []
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: {
    a: ["http", "https", "mailto"],
    img: ["http", "https"]
  },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href?.trim() ?? "";
      const safeHref = isSafeUrl(href, ["http:", "https:", "mailto:"])
        ? href
        : undefined;

      return {
        tagName,
        attribs: {
          ...(safeHref ? { href: safeHref } : {}),
          ...(attribs.title ? { title: attribs.title } : {}),
          ...(attribs.target === "_blank" ? { target: "_blank" } : {}),
          rel: "noopener noreferrer"
        }
      };
    },
    img: (tagName, attribs) => {
      const src = attribs.src?.trim() ?? "";
      const safeSrc = isSafeUrl(src, ["http:", "https:"])
        ? src
        : undefined;

      return {
        tagName,
        attribs: {
          ...(safeSrc ? { src: safeSrc } : {}),
          ...(attribs.alt ? { alt: attribs.alt } : {}),
          ...(attribs.title ? { title: attribs.title } : {}),
          loading: "lazy"
        }
      };
    }
  }
};

/**
 * Les descriptions viennent de Tebex et sont injectées en HTML dans les
 * fiches produit. Elles sont donc nettoyées avec une allowlist stricte avant
 * tout rendu.
 */
export function sanitizeDescription(
  value: string | null | undefined
): string {
  if (!value || value.trim().length === 0) return "";
  return sanitizeHtml(value, DESCRIPTION_OPTIONS);
}