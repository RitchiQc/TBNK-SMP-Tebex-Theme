"use client";

import { useEffect, useRef } from "react";

/**
 * Nettoie automatiquement la session quand Tebex a encaissé le panier sans
 * déclencher la redirection de retour (`/api/checkout/success`).
 */
export function PaidBasketCleaner() {
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    window.location.replace("/api/checkout/success");
  }, []);

  return null;
}
