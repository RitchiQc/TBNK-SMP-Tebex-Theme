import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  clearBasketIdentCookie,
  clearMockBasketCookie,
  clearPendingAddCookie
} from "@/lib/basket/cookies";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Tebex redirige ici après un paiement terminé (et Tebex.js est également
 * écouté côté client via `payment:complete`). On supprime le panier local
 * pour éviter qu'un client puisse relancer un checkout sur des articles déjà
 * achetés, puis on affiche le message de confirmation sur l'accueil.
 */
async function clearBasketAndRedirect(): Promise<NextResponse> {
  await clearBasketIdentCookie();
  await clearMockBasketCookie();
  await clearPendingAddCookie();

  revalidatePath("/cart");
  revalidatePath("/", "layout");

  // Ne jamais construire cette redirection depuis `request.url` : un Host
  // forgé pourrait transformer cette route en open redirect.
  const redirectUrl = new URL("/", siteConfig.url);
  redirectUrl.searchParams.set("checkout", "success");
  return NextResponse.redirect(redirectUrl, { status: 303 });
}

export async function GET(_request: Request) {
  return clearBasketAndRedirect();
}

/**
 * Tebex peut appeler `complete_url` en POST selon la configuration du
 * checkout : on traite les deux méthodes de la même façon.
 */
export async function POST(_request: Request) {
  return clearBasketAndRedirect();
}
