import { percentOff } from "@/lib/format";
import { siteConfig } from "@/lib/site";
import { sanitizeDescription } from "./sanitize";
import { isAllowedTebexUrl, isHttpsUrl } from "./urls";
import type {
  AuthProvider,
  Basket,
  BasketPackage,
  Category,
  Package,
  PackageMedia,
  PackageType,
  PackageVariable,
  PackageVariableOption,
  PackageVariableType,
  Webstore
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStr(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function toNullableStr(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function toNum(value: unknown, fallback = 0): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toBool(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return fallback;
}

function toPackageType(value: unknown): PackageType {
  if (value === "subscription") return "subscription";
  if (value === "both") return "both";
  return "single";
}

function toHttpsUrl(value: unknown): string | null {
  const candidate = toNullableStr(value);
  return candidate && isHttpsUrl(candidate) ? candidate : null;
}

function toVariableType(value: unknown): PackageVariableType {
  const allowed: PackageVariableType[] = [
    "dropdown",
    "text",
    "numeric",
    "alpha",
    "alphanumeric",
    "username",
    "email"
  ];
  return allowed.includes(value as PackageVariableType)
    ? (value as PackageVariableType)
    : "text";
}

export function mapWebstore(raw: unknown): Webstore {
  const source = isRecord(raw) ? raw : {};
  return {
    name: toStr(source.name, siteConfig.name),
    description: toStr(source.description, siteConfig.description),
    logo: toHttpsUrl(source.logo),
    currency: toStr(source.currency, siteConfig.currency).toUpperCase(),
    lang: toStr(source.lang, "fr"),
    platformType: toStr(source.platform_type, "Minecraft: Java Edition"),
    supportsUsernames: toBool(source.supports_usernames, true),
    supportsGifting: toBool(source.supports_gifting, false),
    disabled: toBool(source.disabled, false)
  };
}

function mapMedia(raw: unknown): PackageMedia[] {
  if (!Array.isArray(raw)) return [];

  const media: PackageMedia[] = [];
  for (const item of raw) {
    if (!isRecord(item)) continue;
    const url = toHttpsUrl(item.url);
    if (!url) continue;

    media.push({
      type: item.type === "video" ? "video" : "image",
      url,
      name: toNullableStr(item.name),
      primary: toBool(item.primary),
      featured: toBool(item.featured)
    });
  }

  return media;
}

/**
 * Choisit l'image à afficher sur une carte produit.
 * Une vidéo ne doit jamais devenir `pkg.image`, sinon le `<img>` échoue et
 * affiche le placeholder alors que le package possède une image.
 */
function pickPrimaryImage(media: PackageMedia[]): string | null {
  const images = media.filter((item) => item.type === "image");
  return (
    images.find((item) => item.primary)?.url ??
    images.find((item) => item.featured)?.url ??
    images[0]?.url ??
    null
  );
}

function mapVariableOptions(raw: unknown): PackageVariableOption[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isRecord)
    .map((item) => ({
      name: toStr(item.name, toStr(item.value)),
      value: toStr(item.value, toStr(item.name))
    }))
    .filter((item) => item.name.length > 0 && item.value.length > 0);
}

function mapVariables(raw: unknown): PackageVariable[] {
  if (!Array.isArray(raw)) return [];
  const variables: PackageVariable[] = [];

  for (const item of raw) {
    if (typeof item === "string") {
      variables.push({
        identifier: item,
        type: "text",
        options: []
      });
      continue;
    }

    if (!isRecord(item)) continue;

    const identifier = toStr(
      item.identifier,
      toStr(item.name, toStr(item.id))
    );
    if (!identifier) continue;

    const type = toVariableType(item.type);
    variables.push({
      identifier,
      type,
      options: type === "dropdown" ? mapVariableOptions(item.options) : []
    });
  }

  return variables;
}

export function mapCategory(raw: unknown): Category {
  const source = isRecord(raw) ? raw : {};
  const id = toNum(source.id);
  const name = toStr(source.name, "Catégorie");
  const slug = toStr(source.slug, String(id));
  const packagesRaw = Array.isArray(source.packages) ? source.packages : [];

  return {
    id,
    name,
    slug,
    description: sanitizeDescription(toStr(source.description)),
    imageUrl: toHttpsUrl(source.image_url),
    displayType: source.display_type === "list" ? "list" : "grid",
    order: toNum(source.order),
    tiered: toBool(source.tiered),
    packages: packagesRaw
      .filter(isRecord)
      .map((item) => mapPackage(item, { id, name, slug }))
  };
}

export function mapPackage(
  raw: unknown,
  category: { id: number; name: string; slug: string }
): Package {
  const source = isRecord(raw) ? raw : {};
  const id = toNum(source.id);
  const media = mapMedia(source.media);
  const image = toHttpsUrl(source.image) ?? pickPrimaryImage(media);
  const basePrice = toNum(source.base_price);
  const totalPrice = toNum(source.total_price, basePrice);
  const discount = Math.max(0, basePrice - totalPrice, toNum(source.discount));
  const type = toPackageType(source.type);
  // Ne jamais fabriquer d'ident : Tebex accepte l'ID numérique en repli.
  const ident = toStr(source.ident, String(id));
  const primaryMedia =
    media.length > 0
      ? media
      : image
        ? [
            {
              type: "image" as const,
              url: image,
              name: null,
              primary: true,
              featured: false
            }
          ]
        : [];

  return {
    id,
    ident,
    name: toStr(source.name, "Package"),
    slug: toStr(source.slug, ident),
    description: sanitizeDescription(toStr(source.description)),
    image,
    media: primaryMedia,
    type,
    basePrice,
    discount,
    totalPrice,
    currency: toStr(source.currency, siteConfig.currency).toUpperCase(),
    expirationDate: toNullableStr(source.expiration_date),
    billingPeriod:
      toNullableStr(source.expiry_period) ??
      toNullableStr(source.expiryPeriod),
    categoryId: category.id,
    categoryName: category.name,
    categorySlug: category.slug,
    variables: mapVariables(source.variables),
    disableQuantity: toBool(source.disable_quantity) || type === "subscription",
    disableGifting: toBool(source.disable_gifting),
    order: toNum(source.order),
    featured: media.some((item) => item.featured),
    popular: false,
    discountPercent: percentOff(basePrice, totalPrice)
  };
}

function mapBasketPackage(raw: unknown): BasketPackage {
  const source = isRecord(raw) ? raw : {};
  const inBasket = isRecord(source.in_basket) ? source.in_basket : {};
  const optionsRaw = Array.isArray(source.options) ? source.options : [];
  const id = toNum(source.id);
  // Tebex n'expose pas d'`ident` pour un package de panier : on ne fabrique rien.
  const ident = toNullableStr(source.ident) ?? "";

  return {
    id,
    ident,
    name: toStr(source.name, "Package"),
    slug: toStr(source.slug, ident || String(id)),
    description: toStr(source.description),
    image: toHttpsUrl(source.image),
    type: toPackageType(source.type),
    quantity: toNum(inBasket.quantity, 1),
    unitPrice: toNum(inBasket.price),
    options: optionsRaw
      .filter(isRecord)
      .map((option) => ({
        name: toStr(option.name),
        value: toStr(option.value)
      }))
      .filter((option) => option.name.length > 0),
    expiryPeriod: toNullableStr(source.expiry_period) ?? undefined
  };
}

export function mapBasket(raw: unknown): Basket {
  const source = isRecord(raw) ? raw : {};
  const packagesRaw = Array.isArray(source.packages) ? source.packages : [];
  const couponsRaw = Array.isArray(source.coupons) ? source.coupons : [];
  const giftcardsRaw = Array.isArray(source.giftcards) ? source.giftcards : [];
  const links = isRecord(source.links) ? source.links : {};
  const checkoutUrl = toNullableStr(links.checkout);

  return {
    ident: toStr(source.ident),
    complete: toBool(source.complete),
    username: toNullableStr(source.username),
    currency: toStr(source.currency, siteConfig.currency).toUpperCase(),
    basePrice: toNum(source.base_price),
    salesTax: toNum(source.sales_tax),
    totalPrice: toNum(source.total_price),
    packages: packagesRaw
      .filter(isRecord)
      .map(mapBasketPackage)
      .filter((item) => item.quantity > 0),
    coupons: couponsRaw
      .filter(isRecord)
      .map((item) => ({ code: toStr(item.code) }))
      .filter((item) => item.code.length > 0),
    giftcards: giftcardsRaw
      .filter(isRecord)
      .map((item) => ({ cardNumber: toStr(item.card_number) }))
      .filter((item) => item.cardNumber.length > 0),
    creatorCode: toNullableStr(source.creator_code),
    checkoutUrl: isAllowedTebexUrl(checkoutUrl) ? checkoutUrl : null,
    isMock: false
  };
}

export function mapAuthProviders(raw: unknown): AuthProvider[] {
  const outer = Array.isArray(raw) ? raw : [];
  const items = Array.isArray(outer[0]) ? outer[0] : outer;

  return items
    .filter(isRecord)
    .map((item) => ({
      name: toStr(item.name),
      url: toStr(item.url)
    }))
    .filter(
      (item) =>
        item.name.length > 0 &&
        item.url.length > 0 &&
        isAllowedTebexUrl(item.url)
    );
}
