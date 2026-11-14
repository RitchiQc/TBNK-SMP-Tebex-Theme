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

export const legalIdentity = {
  name: configured(siteConfig.legalName, "Identité légale à compléter"),
  address: configured(siteConfig.legalAddress, "Adresse à compléter"),
  phone: configured(siteConfig.legalPhone, "Téléphone à compléter"),
  supportEmail: siteConfig.supportEmail.trim(),
  privacyEmail: siteConfig.privacyEmail.trim() || siteConfig.supportEmail.trim(),
  officer: configured(siteConfig.privacyOfficer, "Responsable à désigner"),
  governingLaw: escapeHtml(siteConfig.governingLaw)
};

export function emailLink(email: string, label = email): string {
  if (!email) return "Courriel à compléter";
  return `<a href="mailto:${escapeHtml(email)}">${escapeHtml(label)}</a>`;
}

export function contactBlock(): string {
  return `
    <p>
      <strong>${legalIdentity.name}</strong><br />
      ${legalIdentity.address}<br />
      Téléphone : ${legalIdentity.phone}<br />
      Soutien : ${emailLink(legalIdentity.supportEmail)}<br />
      Confidentialité : ${emailLink(legalIdentity.privacyEmail)}<br />
      Responsable de la protection des renseignements personnels :
      ${legalIdentity.officer}
    </p>
  `;
}
