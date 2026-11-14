import { NextResponse } from "next/server";
import {
  clearBasketIdentCookie,
  clearMockBasketCookie,
  clearPendingAddCookie
} from "@/lib/basket/cookies";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Tebex redirige ici après un paiement terminé. On supprime le panier local
 * pour éviter qu'un client puisse relancer un checkout sur des articles déjà
 * achetés, puis on affiche le message de confirmation sur l'accueil.
 */
export async function GET(_request: Request) {
  await clearBasketIdentCookie();
  await clearMockBasketCookie();
  await clearPendingAddCookie();

  // Ne jamais construire cette redirection depuis `request.url` : un Host
  // forgé pourrait transformer cette route en open redirect.
  const redirectUrl = new URL("/", siteConfig.url);
  redirectUrl.searchParams.set("checkout", "success");
  return NextResponse.redirect(redirectUrl, { status: 303 });
}