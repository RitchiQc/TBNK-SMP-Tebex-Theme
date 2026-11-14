"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { safeRedirectPath } from "@/lib/format";
import {
  addPackageRaw,
  applyCouponRaw,
  isMockMode,
  removeCouponRaw,
  removePackageRaw,
  TebexError,
  updatePackageQuantityRaw
} from "@/lib/tebex/client";
import { getPackageById, getWebstore } from "@/lib/tebex/store";
import type {
  AddToBasketInput,
  BasketActionResult,
  LoginState
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

function clampQuantity(value: number): number {
  return Math.min(50, Math.max(1, Math.trunc(value)));
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return fallback;
}

function isAuthError(error: unknown): boolean {
  if (
    error instanceof TebexError &&
    (error.status === 401 || error.status === 403)
  ) {
    return true;
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

function validateVariables(
  input: AddToBasketInput,
  packageVariables: Array<{ identifier: string }>
): string | null {
  for (const variable of packageVariables) {
    const value = input.variableData?.[variable.identifier];
    if (!value || value.trim().length === 0) {
      return "Complète toutes les options du package avant de l'ajouter au panier.";
    }
  }
  return null;
}

export async function addToBasketAction(
  input: AddToBasketInput
): Promise<BasketActionResult> {
  const packageId = Number(input.packageId);
  if (!Number.isFinite(packageId) || packageId <= 0) {
    return { success: false, error: "Package invalide." };
  }

  const pkg = await getPackageById(packageId);
  if (!pkg) {
    return { success: false, error: "Ce package n'existe plus." };
  }

  const variableError = validateVariables(input, pkg.variables);
  if (variableError) {
    return { success: false, error: variableError };
  }

  const quantity =
    pkg.type === "subscription" || pkg.disableQuantity
      ? 1
      : clampQuantity(Number(input.quantity));
  const returnPath = safeRedirectPath(input.returnPath);

  if (isMockMode) {
    const data = parseMockBasketData(await getMockBasketCookie());
    const next = addMockItem(data, packageId, quantity);
    await setMockBasketCookie(serializeMockBasketData(next));
    revalidatePath("/", "layout");
    return {
      success: true,
      message: `${pkg.name} a été ajouté au panier.`
    };
  }

  try {
    const webstore = await getWebstore();
    const username = await getUsernameCookie();

    if (webstore.supportsUsernames && !username) {
      await setPendingAddCookie({
        packageId,
        quantity,
        variableData: input.variableData,
        returnPath
      });
      return {
        success: false,
        error: "Connecte ton pseudo Minecraft pour ajouter ce package.",
        needsLogin: true
      };
    }

    const basket = await ensureBasket(username ?? undefined);
    await addPackageRaw(basket.ident, packageId, quantity, input.variableData);
    revalidatePath("/", "layout");
    return {
      success: true,
      message: `${pkg.name} a été ajouté au panier.`
    };
  } catch (error) {
    if (isAuthError(error)) {
      await setPendingAddCookie({
        packageId,
        quantity,
        variableData: input.variableData,
        returnPath
      });
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
  packageId: number,
  quantity: number
): Promise<BasketActionResult> {
  const id = Number(packageId);
  if (!Number.isFinite(id) || id <= 0) {
    return { success: false, error: "Package invalide." };
  }

  const nextQuantity = clampQuantity(Number(quantity));

  if (isMockMode) {
    const data = parseMockBasketData(await getMockBasketCookie());
    const next = updateMockItem(data, id, nextQuantity);
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
    await updatePackageQuantityRaw(basket.ident, id, nextQuantity);
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
  packageId: number
): Promise<BasketActionResult> {
  const id = Number(packageId);
  if (!Number.isFinite(id) || id <= 0) {
    return { success: false, error: "Package invalide." };
  }

  if (isMockMode) {
    const data = parseMockBasketData(await getMockBasketCookie());
    const next = removeMockItem(data, id);
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
    await removePackageRaw(basket.ident, id);
    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { success: true, message: "Package retiré du panier." };
  } catch (error) {
    console.error("[basket] remove failed", error);
    return {
      success: false,
      error: errorMessage(error, "Impossible de retirer ce package.")
    };
  }
}

export async function applyCouponAction(
  code: string
): Promise<BasketActionResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { success: false, error: "Entre un code promo." };
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
  const normalized = code.trim().toUpperCase();
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
  const target = pending?.returnPath ?? next;

  await setUsernameCookie(username);

  try {
    if (!isMockMode) {
      const currentBasket = await getCurrentBasket();
      const basketUsername = currentBasket?.username?.toLowerCase() ?? null;

      if (currentBasket && basketUsername !== username.toLowerCase()) {
        await clearBasketIdentCookie();
      }

      if (
        previousUsername &&
        previousUsername.toLowerCase() !== username.toLowerCase()
      ) {
        await clearBasketIdentCookie();
      }
    }

    if (pending) {
      try {
        if (isMockMode) {
          const data = parseMockBasketData(await getMockBasketCookie());
          const nextBasket = addMockItem(
            data,
            pending.packageId,
            pending.quantity
          );
          await setMockBasketCookie(serializeMockBasketData(nextBasket));
        } else {
          const basket = await ensureBasket(username);
          await addPackageRaw(
            basket.ident,
            pending.packageId,
            pending.quantity,
            pending.variableData
          );
        }
      } catch (error) {
        console.error("[basket] pending add after login failed", error);
      }
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
