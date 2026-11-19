import "server-only";

import { mockPackages } from "@/data/mock";
import { siteConfig } from "@/lib/site";
import type { Basket, BasketPackage } from "@/lib/tebex/types";

export const MOCK_COUPON_CODE = "TBNK10";
const MOCK_COUPON_PERCENT = 10;

export type MockBasketData = {
  items: Array<{ id: number; quantity: number }>;
  coupon: string | null;
};

export function emptyMockBasketData(): MockBasketData {
  return { items: [], coupon: null };
}

function clampQuantity(value: number): number {
  return Math.min(50, Math.max(1, Math.trunc(value)));
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseJsonValue<T>(value: string): T | null {
  const attempts = [
    value,
    (() => {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    })(),
    (() => {
      try {
        return decodeURIComponent(decodeURIComponent(value));
      } catch {
        return value;
      }
    })()
  ];

  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt) as T;
    } catch {
      // Essaie l'encodage suivant.
    }
  }

  return null;
}

export function parseMockBasketData(
  value: string | null | undefined
): MockBasketData {
  if (!value) return emptyMockBasketData();

  const parsed = parseJsonValue<unknown>(value);
  if (!parsed || typeof parsed !== "object") return emptyMockBasketData();

  const record = parsed as Record<string, unknown>;
  const itemsRaw = Array.isArray(record.items) ? record.items : [];
  const merged = new Map<number, number>();

  for (const item of itemsRaw) {
    if (!item || typeof item !== "object") continue;
    const entry = item as Record<string, unknown>;
    const id = Number(entry.id);
    const quantity = Number(entry.quantity);
    if (!Number.isFinite(id) || !Number.isFinite(quantity)) continue;
    if (!mockPackages.some((pkg) => pkg.id === id)) continue;
    merged.set(id, clampQuantity((merged.get(id) ?? 0) + quantity));
  }

  return {
    items: Array.from(merged.entries()).map(([id, quantity]) => ({
      id,
      quantity
    })),
    coupon:
      typeof record.coupon === "string"
        ? record.coupon.trim().slice(0, 64) || null
        : null
  };
}

export function serializeMockBasketData(data: MockBasketData): string {
  return JSON.stringify(data);
}

export function addMockItem(
  data: MockBasketData,
  packageId: number,
  quantity: number
): MockBasketData {
  const items = data.items.map((item) => ({ ...item }));
  const existing = items.find((item) => item.id === packageId);

  if (existing) {
    existing.quantity = clampQuantity(existing.quantity + quantity);
  } else if (mockPackages.some((pkg) => pkg.id === packageId)) {
    items.push({ id: packageId, quantity: clampQuantity(quantity) });
  }

  return { ...data, items };
}

export function updateMockItem(
  data: MockBasketData,
  packageId: number,
  quantity: number
): MockBasketData {
  return {
    ...data,
    items: data.items.map((item) =>
      item.id === packageId
        ? { ...item, quantity: clampQuantity(quantity) }
        : item
    )
  };
}

export function removeMockItem(
  data: MockBasketData,
  packageId: number
): MockBasketData {
  return {
    ...data,
    items: data.items.filter((item) => item.id !== packageId)
  };
}

export function applyMockCoupon(
  data: MockBasketData,
  code: string
): { data: MockBasketData; error?: string } {
  const normalized = code.trim().toUpperCase();
  if (normalized !== MOCK_COUPON_CODE) {
    return {
      data,
      error: `Code promo invalide. En mode démo, utilise ${MOCK_COUPON_CODE}.`
    };
  }
  return { data: { ...data, coupon: normalized } };
}

export function buildMockBasket(
  data: MockBasketData,
  username: string | null
): Basket {
  const packages: BasketPackage[] = [];
  let basePrice = 0;
  let subtotal = 0;

  for (const item of data.items) {
    const pkg = mockPackages.find((candidate) => candidate.id === item.id);
    if (!pkg) continue;

    const linePrice = roundMoney(pkg.totalPrice * item.quantity);
    basePrice += pkg.basePrice * item.quantity;
    subtotal += linePrice;

    packages.push({
      id: pkg.id,
      ident: pkg.ident,
      name: pkg.name,
      slug: pkg.slug,
      description: pkg.description,
      image: pkg.image,
      type: pkg.type,
      quantity: item.quantity,
      unitPrice: pkg.totalPrice,
      options: []
    });
  }

  const coupon = data.coupon?.toUpperCase() ?? null;
  const discount =
    coupon === MOCK_COUPON_CODE
      ? roundMoney(subtotal * (MOCK_COUPON_PERCENT / 100))
      : 0;

  return {
    ident: "demo-basket",
    complete: false,
    username,
    currency: siteConfig.currency,
    basePrice: roundMoney(basePrice),
    salesTax: 0,
    totalPrice: roundMoney(Math.max(0, subtotal - discount)),
    packages,
    coupons: coupon ? [{ code: coupon }] : [],
    giftcards: [],
    creatorCode: null,
    checkoutUrl: null,
    isMock: true
  };
}

export function mockBasketCount(data: MockBasketData): number {
  return data.items.reduce((total, item) => total + item.quantity, 0);
}
