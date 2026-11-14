import { contact } from "./contact";
import { privacy } from "./privacy";
import { refund } from "./refund";
import { terms } from "./terms";
import type { LegalPage } from "./types";

export const LEGAL_PAGES: Record<string, LegalPage> = {
  terms,
  privacy,
  refund,
  contact
};

export const LEGAL_LINKS = [
  { slug: "terms", label: "Conditions" },
  { slug: "privacy", label: "Confidentialité" },
  { slug: "refund", label: "Remboursement" },
  { slug: "contact", label: "Contact" }
] as const;

export function getLegalPage(slug: string): LegalPage | null {
  return LEGAL_PAGES[slug] ?? null;
}

export type { LegalPage };
