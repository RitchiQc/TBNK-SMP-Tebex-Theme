import { NextResponse } from "next/server";
import {
  clearBasketIdentCookie,
  clearMockBasketCookie,
  clearPendingAddCookie
} from "@/lib/basket/cookies";

export const dynamic = "force-dynamic";

/**
 * Tebex redirige ici après un paiement terminé. On supprime le panier local
 * pour éviter qu'un client puisse relancer un checkout sur des articles déjà
 * achetés, puis on affiche le message de confirmation sur l'accueil.
 */
export async function GET(request: Request) {
  await clearBasketIdentCookie();
  await clearMockBasketCookie();
  await clearPendingAddCookie();

  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("checkout", "success");
  return NextResponse.redirect(redirectUrl, { status: 303 });
}