"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { safeRedirectPath } from "@/lib/format";
import { rateLimit } from "@/lib/rate-limit";
import {
  addPackageRaw,
  applyCouponRaw,
  isMockMode,
  removeCouponRaw,
  removePackageRaw,
  TebexError,
  updatePackageQuantityRaw
} from "@/lib/tebex/client";
import { getPackageByIdent, getWebstore } from "@/lib/tebex/store";
import type { Package, PackageVariable } from "@/lib/tebex/types";
import type {
  AddToBasketInput,
  BasketActionResult,
  LoginState,
  PendingAdd
} from "./action-types";
import {
  clearBasketIdentCookie,
  clearMockBasketCookie,
  clearPendingAddCookie,
  clearUsernameCookie,
  getBasketIdentCookie,
  getMockBasketCookie,
  getPendingAddCookie,
  getUsernameCookie,
  setMockBasketCookie,
  setPendingAddCookie,
  setUsernameCookie
} from "./cookies";
import {
  addMockItem,
  applyMockCoupon,
  parseMockBasketData,
  removeMockItem,
  serializeMockBasketData,
  updateMockItem
} from "./mock";
import { ensureBasket, getCurrentBasket } from "./session";

const MAX_VARIABLE_LENGTH = 128;
const MAX_VARIABLE_COUNT = 50;
const MAX_VARIABLE_PAYLOAD = 2000;
const MAX_COUPON_LENGTH = 64;
const MAX_PACKAGE_REFERENCE_LENGTH = 64;
const MAX_RETURN_PATH_LENGTH = 512;

function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(50, Math.max(1, Math.trunc(value)));
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof TebexError) {
    if (error.status === 429) {
      return "Trop de requêtes vers Tebex. Réessaie dans un instant.";
    }
    if (error.status === 422) {
      return "Tebex a refusé cette demande. Vérifie les informations saisies.";
    }
  }
  return fallback;
}

function isAuthError(error: unknown): boolean {
  if (error instanceof TebexError) {
    return error.status === 401 || error.status === 403;
  }

  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("login") ||
    message.includes("authorized") ||
    message.includes("authorize") ||
    message.includes("username") ||
    message.includes("must be logged")
  );
}

function validateVariableValue(
  variable: PackageVariable,
  rawValue: unknown
): string | null {
  if (typeof rawValue !== "string") {
    return "Complète toutes les options du package avant de l'ajouter au panier.";
  }

  const value = rawValue.trim();
  if (!value) {
    return "Complète toutes les options du package avant de l'ajouter au panier.";
  }

  if (value.length > MAX_VARIABLE_LENGTH) {
    return "Une option du package est trop longue.";
  }

  switch (variable.type) {
    case "dropdown":
      if (!variable.options.some((option) => option.value === value)) {
        return "Choisis une option valide pour ce package.";
      }
      break;
    case "numeric":
      if (!/^\d+$/.test(value)) {
        return "Cette option doit être numérique.";
      }
      break;
    case "alpha":
      if (!/^[A-Za-z]+$/.test(value)) {
        return "Cette option doit contenir uniquement des lettres.";
      }
      break;
    case "alphanumeric":
      if (!/^[A-Za-z0-9]+$/.test(value)) {
        return "Cette option doit être alphanumérique.";
      }
      break;
    case "username":
      if (!/^[A-Za-z0-9_]{3,16}$/.test(value)) {
        return "Entre un pseudo Minecraft valide (3 à 16 caractères : lettres, chiffres et _).";
      }
      break;
    case "email":
      if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        return "Entre une adresse e-mail valide.";
      }
      break;
    case "text":
    default:
      break;
  }

  return null;
}

function validateVariables(
  input: AddToBasketInput,
  packageVariables: PackageVariable[]
): string | null {
  const data = input.variableData;

  if (
    data !== undefined &&
    (typeof data !== "object" || data === null || Array.isArray(data))
  ) {
    return "Options de package invalides.";
  }

  if (data) {
    const keys = Object.keys(data);
    if (keys.length > MAX_VARIABLE_COUNT) {
      return "Trop d'options ont été fournies pour ce package.";
    }

    let payloadLength = 0;
    try {
      payloadLength = JSON.stringify(data).length;
    } catch {
      return "Options de package invalides.";
    }
    if (payloadLength > MAX_VARIABLE_PAYLOAD) {
      return "Les options du package sont trop volumineuses.";
    }

    const allowed = new Set(packageVariables.map((variable) => variable.identifier));
    for (const key of keys) {
      if (!allowed.has(key)) {
        return "Option de package inconnue.";
      }
    }
  }

  for (const variable of packageVariables) {
    const error = validateVariableValue(
      variable,
      data?.[variable.identifier]
    );
    if (error) return error;
  }

  return null;
}

type ResolvedAdd = {
  pkg: Package;
  quantity: number;
  variableData?: Record<string, string>;
  returnPath: string;
};

async function resolveAddInput(
  input: AddToBasketInput
): Promise<
  { ok: true; value: ResolvedAdd } | { ok: false; error: string }
> {
  const reference = String(input.packageId ?? "").trim();
  if (!reference || reference.length > MAX_PACKAGE_REFERENCE_LENGTH) {
    return { ok: false, error: "Package invalide." };
  }

  const pkg = await getPackageByIdent(reference);
  if (!pkg) {
    return { ok: false, error: "Ce package n'existe plus." };
  }

  const variableError = validateVariables(input, pkg.variables);
  if (variableError) {
    return { ok: false, error: variableError };
  }

  const rawQuantity = Number(input.quantity);
  if (!Number.isFinite(rawQuantity)) {
    return { ok: false, error: "Quantité invalide." };
  }

  const quantity =
    pkg.type === "subscription" ||
    pkg.type === "both" ||
    pkg.disableQuantity
      ? 1
      : clampQuantity(rawQuantity);

  return {
    ok: true,
    value: {
      pkg,
      quantity,
      variableData: input.variableData,
      returnPath: safeRedirectPath(input.returnPath).slice(
        0,
        MAX_RETURN_PATH_LENGTH
      )
    }
  };
}

export async function addToBasketAction(
  input: AddToBasketInput
): Promise<BasketActionResult> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { success: false, error: "Requête invalide." };
  }

  if (!(await rateLimit("basket:add", 30, 60_000))) {
    return {
      success: false,
      error: "Trop de tentatives. Réessaie dans une minute."
    };
  }

  const resolved = await resolveAddInput(input);
  if (!resolved.ok) {
    return { success: false, error: resolved.error };
  }

  const { pkg, quantity, variableData, returnPath } = resolved.value;
  const pending: PendingAdd = {
    packageId: pkg.ident,
    quantity,
    variableData,
    returnPath
  };

  if (isMockMode) {
    const data = parseMockBasketData(await getMockBasketCookie());
    const next = addMockItem(data, pkg.id, quantity);
    await setMockBasketCookie(serializeMockBasketData(next));
    revalidatePath("/", "layout");
    return {
      success: true,
      message: `${pkg.name} a été ajouté au panier.`
    };
  }

  try {
    const webstore = await getWebstore();
    if (webstore.disabled) {
      return {
        success: false,
        error: "La boutique est temporairement fermée."
      };
    }

    const username = await getUsernameCookie();

    if (webstore.supportsUsernames && !username) {
      await setPendingAddCookie(pending);
      return {
        success: false,
        error: "Connecte ton pseudo Minecraft pour ajouter ce package.",
        needsLogin: true
      };
    }

    const basket = await ensureBasket(username ?? undefined);
    await addPackageRaw(basket.ident, pkg.ident, quantity, variableData);
    revalidatePath("/", "layout");
    return {
      success: true,
      message: `${pkg.name} a été ajouté au panier.`
    };
  } catch (error) {
    if (isAuthError(error)) {
      try {
        await setPendingAddCookie(pending);
      } catch (pendingError) {
        console.error("[basket] pending add failed", pendingError);
      }
      return {
        success: false,
        error: "Connecte ton pseudo Minecraft pour continuer.",
        needsLogin: true
      };
    }

    console.error("[basket] add failed", error);
    return {
      success: false,
      error: errorMessage(
        error,
        "Impossible d'ajouter ce package au panier. Réessaie dans un instant."
      )
    };
  }
}

export async function updateQuantityAction(
  packageId: number | string,
  quantity: number
): Promise<BasketActionResult> {
  if (!(await rateLimit("basket:update", 60, 60_000))) {
    return {
      success: false,
      error: "Trop de tentatives. Réessaie dans une minute."
    };
  }

  const reference = String(packageId ?? "").trim();
  if (!reference) {
    return { success: false, error: "Package invalide." };
  }

  const rawQuantity = Number(quantity);
  if (!Number.isFinite(rawQuantity)) {
    return { success: false, error: "Quantité invalide." };
  }
  const nextQuantity = clampQuantity(rawQuantity);

  if (isMockMode) {
    const pkg = await getPackageByIdent(reference);
    if (!pkg) {
      return { success: false, error: "Ce package n'existe plus." };
    }

    const data = parseMockBasketData(await getMockBasketCookie());
    if (!data.items.some((item) => item.id === pkg.id)) {
      return { success: false, error: "Ce package n'est plus dans ton panier." };
    }

    const next = updateMockItem(data, pkg.id, nextQuantity);
    await setMockBasketCookie(serializeMockBasketData(next));
    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { success: true, message: "Quantité mise à jour." };
  }

  try {
    const basket = await getCurrentBasket();
    if (!basket) {
      return { success: false, error: "Ton panier est vide." };
    }

    const item = basket.packages.find(
      (candidate) =>
        candidate.ident === reference || String(candidate.id) === reference
    );
    if (!item) {
      return { success: false, error: "Ce package n'est plus dans ton panier." };
    }

    await updatePackageQuantityRaw(
      basket.ident,
      item.ident || String(item.id),
      nextQuantity
    );
    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { success: true, message: "Quantité mise à jour." };
  } catch (error) {
    if (isAuthError(error)) {
      return {
        success: false,
        error: "Connecte-toi pour modifier la quantité de ton panier.",
        needsAuth: true
      };
    }
    console.error("[basket] update quantity failed", error);
    return {
      success: false,
      error: errorMessage(error, "Impossible de modifier la quantité.")
    };
  }
}

export async function removeFromBasketAction(
  packageId: number | string
): Promise<BasketActionResult> {
  if (!(await rateLimit("basket:remove", 60, 60_000))) {
    return {
      success: false,
      error: "Trop de tentatives. Réessaie dans une minute."
    };
  }

  const reference = String(packageId ?? "").trim();
  if (!reference) {
    return { success: false, error: "Package invalide." };
  }

  if (isMockMode) {
    const pkg = await getPackageByIdent(reference);
    if (!pkg) {
      return { success: false, error: "Ce package n'existe plus." };
    }

    const data = parseMockBasketData(await getMockBasketCookie());
    if (!data.items.some((item) => item.id === pkg.id)) {
      return { success: false, error: "Ce package n'est plus dans ton panier." };
    }

    const next = removeMockItem(data, pkg.id);
    await setMockBasketCookie(serializeMockBasketData(next));
    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { success: true, message: "Package retiré du panier." };
  }

  try {
    const basket = await getCurrentBasket();
    if (!basket) {
      return { success: false, error: "Ton panier est vide." };
    }

    const item = basket.packages.find(
      (candidate) =>
        candidate.ident === reference || String(candidate.id) === reference
    );
    if (!item) {
      return { success: false, error: "Ce package n'est plus dans ton panier." };
    }

    await removePackageRaw(basket.ident, item.ident || String(item.id));
    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { success: true, message: "Package retiré du panier." };
  } catch (error) {
    if (isAuthError(error)) {
      return {
        success: false,
        error: "Connecte-toi pour retirer ce package de ton panier.",
        needsAuth: true
      };
    }
    console.error("[basket] remove failed", error);
    return {
      success: false,
      error: errorMessage(error, "Impossible de retirer ce package.")
    };
  }
}

function normalizeCouponCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  if (
    !normalized ||
    normalized.length > MAX_COUPON_LENGTH ||
    /[\u0000-\u001F\u007F]/.test(normalized)
  ) {
    return null;
  }
  return normalized;
}

export async function applyCouponAction(
  code: string
): Promise<BasketActionResult> {
  if (!(await rateLimit("basket:coupon", 10, 60_000))) {
    return {
      success: false,
      error: "Trop de tentatives. Réessaie dans une minute."
    };
  }

  const normalized = normalizeCouponCode(code);
  if (!normalized) {
    return { success: false, error: "Entre un code promo valide." };
  }

  if (isMockMode) {
    const data = parseMockBasketData(await getMockBasketCookie());
    const result = applyMockCoupon(data, normalized);
    if (result.error) {
      return { success: false, error: result.error };
    }
    await setMockBasketCookie(serializeMockBasketData(result.data));
    revalidatePath("/cart");
    return { success: true, message: "Code promo appliqué." };
  }

  try {
    const basket = await getCurrentBasket();
    if (!basket) {
      return { success: false, error: "Ton panier est vide." };
    }
    await applyCouponRaw(basket.ident, normalized);
    revalidatePath("/cart");
    return { success: true, message: "Code promo appliqué." };
  } catch (error) {
    console.error("[basket] coupon failed", error);
    return {
      success: false,
      error: errorMessage(error, "Ce code promo n'est pas valide.")
    };
  }
}

export async function removeCouponAction(
  code: string
): Promise<BasketActionResult> {
  if (!(await rateLimit("basket:coupon-remove", 10, 60_000))) {
    return {
      success: false,
      error: "Trop de tentatives. Réessaie dans une minute."
    };
  }

  const normalized = normalizeCouponCode(code);
  if (!normalized) {
    return { success: false, error: "Code promo invalide." };
  }

  if (isMockMode) {
    const data = parseMockBasketData(await getMockBasketCookie());
    await setMockBasketCookie(
      serializeMockBasketData({ ...data, coupon: null })
    );
    revalidatePath("/cart");
    return { success: true, message: "Code promo retiré." };
  }

  try {
    const basket = await getCurrentBasket();
    if (!basket) {
      return { success: false, error: "Ton panier est vide." };
    }
    await removeCouponRaw(basket.ident, normalized);
    revalidatePath("/cart");
    return { success: true, message: "Code promo retiré." };
  } catch (error) {
    console.error("[basket] remove coupon failed", error);
    return {
      success: false,
      error: errorMessage(error, "Impossible de retirer ce code promo.")
    };
  }
}

export async function loginAction(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  if (
    !formData ||
    typeof (formData as { get?: unknown }).get !== "function"
  ) {
    return { error: "Requête invalide." };
  }

  if (!(await rateLimit("auth:login", 20, 60_000))) {
    return { error: "Trop de tentatives. Réessaie dans une minute." };
  }

  const username = String(formData.get("username") ?? "").trim();
  const next = safeRedirectPath(String(formData.get("next") ?? "/"));

  if (!/^[A-Za-z0-9_]{3,16}$/.test(username)) {
    return {
      error:
        "Entre un pseudo Minecraft valide (3 à 16 caractères : lettres, chiffres et _)."
    };
  }

  const previousUsername = await getUsernameCookie();
  const pending = await getPendingAddCookie();
  const pendingTarget = pending ? safeRedirectPath(pending.returnPath) : null;
  const target = pendingTarget && pendingTarget !== "/" ? pendingTarget : next;

  let resolvedPending: ResolvedAdd | null = null;
  if (pending) {
    try {
      const result = await resolveAddInput({
        packageId: pending.packageId,
        quantity: pending.quantity,
        variableData: pending.variableData,
        returnPath: pending.returnPath
      });
      resolvedPending = result.ok ? result.value : null;
    } catch (error) {
      console.error("[basket] invalid pending add", error);
    }
  }

  await setUsernameCookie(username);

  let basketChanged = false;

  try {
    if (!isMockMode) {
      const currentBasket = await getCurrentBasket();
      const basketUsername = currentBasket?.username?.toLowerCase() ?? null;

      if (currentBasket && basketUsername !== username.toLowerCase()) {
        await clearBasketIdentCookie();
        basketChanged = true;
      }

      if (
        previousUsername &&
        previousUsername.toLowerCase() !== username.toLowerCase()
      ) {
        await clearBasketIdentCookie();
        basketChanged = true;
      }
    }

    if (resolvedPending) {
      try {
        if (isMockMode) {
          const data = parseMockBasketData(await getMockBasketCookie());
          const nextBasket = addMockItem(
            data,
            resolvedPending.pkg.id,
            resolvedPending.quantity
          );
          await setMockBasketCookie(serializeMockBasketData(nextBasket));
        } else {
          const basket = await ensureBasket(username, {
            forceNew: basketChanged
          });
          await addPackageRaw(
            basket.ident,
            resolvedPending.pkg.ident,
            resolvedPending.quantity,
            resolvedPending.variableData
          );
        }
      } catch (error) {
        console.error("[basket] pending add after login failed", error);
      }
    }

    if (pending) {
      await clearPendingAddCookie();
    }
  } catch (error) {
    console.error("[basket] login failed", error);
    return {
      error: "Impossible de connecter ce pseudo pour le moment. Réessaie."
    };
  }

  revalidatePath("/", "layout");
  redirect(target);
}

export async function logoutAction(): Promise<void> {
  await clearUsernameCookie();
  await clearBasketIdentCookie();
  await clearMockBasketCookie();
  await clearPendingAddCookie();
  revalidatePath("/", "layout");
  redirect("/");
}
