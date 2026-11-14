"use client";

let scriptPromise: Promise<boolean> | null = null;

/**
 * Charge Tebex.js uniquement au moment où l'utilisateur demande le paiement.
 * Cela évite d'exécuter un script tiers sur la page panier pour tous les
 * visiteurs, et cela réduit la surface d'attaque au strict nécessaire.
 */
export function loadTebexScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Tebex?.checkout) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-tbnk-tebex="true"]'
    );

    if (existing) {
      const check = window.setInterval(() => {
        if (window.Tebex?.checkout) {
          window.clearInterval(check);
          resolve(true);
        }
      }, 100);
      window.setTimeout(() => {
        window.clearInterval(check);
        resolve(Boolean(window.Tebex?.checkout));
      }, 5000);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.tebex.io/v/1.js";
    script.async = true;
    script.dataset.tbnkTebex = "true";
    script.onload = () => resolve(Boolean(window.Tebex?.checkout));
    script.onerror = () => resolve(false);

    document.head.appendChild(script);

    window.setTimeout(() => {
      resolve(Boolean(window.Tebex?.checkout));
    }, 5000);
  });

  return scriptPromise;
}
