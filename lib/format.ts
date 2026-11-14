import { siteConfig } from "@/lib/site";

const currencySymbols: Record<string, string> = {
  CAD: "CA$",
  USD: "US$",
  EUR: "€",
  GBP: "£"
};

export function formatCurrency(
  amount: number,
  currency: string = siteConfig.currency
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const code = currency.trim().toUpperCase() || siteConfig.currency;
  const formatted = new Intl.NumberFormat("fr-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(safeAmount);

  if (code === "CAD") {
    return `CA$${formatted}`;
  }

  const symbol = Object.hasOwn(currencySymbols, code)
    ? currencySymbols[code]
    : undefined;

  if (symbol) {
    return code === "EUR" || code === "GBP"
      ? `${formatted} ${symbol}`
      : `${symbol}${formatted}`;
  }

  return `${formatted} ${code}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("fr-CA").format(
    Number.isFinite(value) ? value : 0
  );
}

export function formatDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric"
  }
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-CA", options).format(date);
}

export function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  return `${input.slice(0, maxLength).trimEnd()}…`;
}

export function cn(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ");
}

export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(/[\s_-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const REDIRECT_ORIGIN = "https://internal.invalid";
const MAX_REDIRECT_PATH_LENGTH = 2048;

/**
 * Valide un chemin de redirection interne.
 *
 * Un simple test `startsWith("//")` ne suffit pas : le parseur d'URL
 * normalise `\` en `/` pour les schémas http(s), et ignore les tabulations.
 * `/\evil.com` devient donc `//evil.com`, soit un domaine externe.
 * On parse donc la valeur avec la même norme que le navigateur, puis on
 * vérifie que l'origine reste interne.
 */
export function safeRedirectPath(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > MAX_REDIRECT_PATH_LENGTH
  ) {
    return "/";
  }

  if (/[\\\u0000-\u001F\u007F]/.test(value)) {
    return "/";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  try {
    const url = new URL(value, REDIRECT_ORIGIN);
    if (url.origin !== REDIRECT_ORIGIN) {
      return "/";
    }

    const path = `${url.pathname}${url.search}${url.hash}`;
    if (!path.startsWith("/") || path.startsWith("//")) {
      return "/";
    }

    return path || "/";
  } catch {
    return "/";
  }
}

export function percentOff(basePrice: number, totalPrice: number): number {
  if (!Number.isFinite(basePrice) || !Number.isFinite(totalPrice)) return 0;
  if (basePrice <= 0 || totalPrice >= basePrice) return 0;
  return Math.max(1, Math.round((1 - totalPrice / basePrice) * 100));
}

export function pluralize(
  count: number,
  singular: string,
  plural: string
): string {
  return count > 1 ? plural : singular;
}
