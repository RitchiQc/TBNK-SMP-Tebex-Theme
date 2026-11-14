const BASKET_IDENT_PATTERN = /^[A-Za-z0-9_.:-]{1,64}$/;

/**
 * Les identifiants de panier Tebex sont opaques. On impose un format borné
 * avant de les envoyer à l'API afin d'éviter qu'un cookie forgé ne déclenche
 * des requêtes arbitraires ou des identifiants démesurés.
 */
export function isValidBasketIdent(value: unknown): value is string {
  return (
    typeof value === "string" &&
    BASKET_IDENT_PATTERN.test(value) &&
    value.length > 0
  );
}

export function normalizeBasketIdent(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return isValidBasketIdent(trimmed) ? trimmed : null;
}
