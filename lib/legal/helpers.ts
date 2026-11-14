import { siteConfig } from "@/lib/site";

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ENTITIES[character] ?? character);
}

function configured(value: string, fallback: string): string {
  return value.trim() ? escapeHtml(value.trim()) : fallback;
}

function optional(value: string): string {
  return value.trim() ? escapeHtml(value.trim()) : "";
}

/**
 * Par défaut, le vendeur des produits est Tebex (marchand of record).
 * TBNK-SMP est l'exploitant du site et du serveur. Les champs
 * NEXT_PUBLIC_LEGAL_* restent facultatifs : ils permettent d'afficher une
 * identité d'entreprise si TBNK-SMP doit être identifié comme vendeur.
 */
export const seller = {
  name: "Tebex",
  legalName: "Tebex Limited",
  address:
    "201 Haverstock Hill, Second Floor C/O Fkgb, London, England, NW3 4QG, Royaume-Uni",
  supportUrl: "https://www.tebex.io/contact",
  termsUrl: "https://checkout.tebex.io/terms-us"
} as const;

export const legalIdentity = {
  name: optional(siteConfig.legalName),
  address: optional(siteConfig.legalAddress),
  phone: optional(siteConfig.legalPhone),
  supportEmail: siteConfig.supportEmail.trim(),
  privacyEmail: siteConfig.privacyEmail.trim() || siteConfig.supportEmail.trim(),
  officer: configured(siteConfig.privacyOfficer, "Responsable à désigner"),
  governingLaw: escapeHtml(siteConfig.governingLaw)
};

export function emailLink(email: string, label = email): string {
  if (!email) return "Courriel à compléter";
  return `<a href="mailto:${escapeHtml(email)}">${escapeHtml(label)}</a>`;
}

export function operatorBlock(): string {
  const identity = legalIdentity.name || escapeHtml(siteConfig.name);
  const address = legalIdentity.address
    ? `${legalIdentity.address}<br />`
    : "";
  const phone = legalIdentity.phone
    ? `Téléphone : ${legalIdentity.phone}<br />`
    : "";

  return `
    <p>
      <strong>${identity}</strong><br />
      ${address}${phone}Exploitant du site et du serveur Minecraft<br />
      Soutien : ${emailLink(legalIdentity.supportEmail)}<br />
      Confidentialité : ${emailLink(legalIdentity.privacyEmail)}<br />
      Responsable de la protection des renseignements personnels :
      ${legalIdentity.officer}
    </p>
  `;
}

export function sellerBlock(): string {
  return `
    <p>
      <strong>Vendeur des produits et marchand of record : ${seller.name}</strong><br />
      ${seller.legalName} — ${seller.address}<br />
      Les achats sont conclus exclusivement avec ${seller.name}, qui gère le
      paiement, les taxes, les reçus, les remboursements et le support lié à la
      transaction. L’entité exacte du vendeur et ses coordonnées sont confirmées
      sur la page de paiement ${seller.name}.<br />
      <a href="${seller.termsUrl}" target="_blank" rel="noopener noreferrer">Conditions de vente et identité du vendeur</a>
      · <a href="${seller.supportUrl}" target="_blank" rel="noopener noreferrer">Soutien ${seller.name}</a>
    </p>
  `;
}

export function contactBlock(): string {
  return `${operatorBlock()}${sellerBlock()}`;
}
