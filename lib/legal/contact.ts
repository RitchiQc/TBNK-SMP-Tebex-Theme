import type { LegalPage } from "./types";
import { contactBlock, emailLink, legalIdentity } from "./helpers";

export const contact: LegalPage = {
  slug: "contact",
  title: "Contact & support",
  description:
    "Contacter le support, le responsable de la confidentialité et le service à la clientèle de TBNK-SMP.",
  updated: "14 novembre 2026",
  html: `
    <h2>Exploitant, vendeur et coordonnées</h2>
    ${contactBlock()}
    <p>Les produits sont vendus par Tebex, vendeur et marchand of record. Le contrat de vente est conclu exclusivement avec Tebex ; TBNK-SMP exploite le site et le serveur et assure la livraison en jeu.</p>

    <h2>Support TBNK-SMP</h2>
    <p>Le support officiel se fait par courriel et sur Discord. C’est le moyen le plus rapide pour obtenir de l’aide sur un achat, une livraison ou un problème en jeu.</p>
    <p>${emailLink(legalIdentity.supportEmail)} — <a href="https://discord.gg/td98WkM7V5" target="_blank" rel="noopener noreferrer">Rejoindre le Discord TBNK-SMP</a></p>

    <h2>Problème de livraison</h2>
    <p>Avant d’ouvrir un ticket, vérifie que :</p>
    <ul>
      <li>tu as utilisé le bon pseudo Minecraft Java ;</li>
      <li>tu t’es connecté au serveur après l’achat ;</li>
      <li>le paiement a bien été confirmé par Tebex ;</li>
      <li>tu as attendu quelques minutes après la transaction.</li>
    </ul>
    <p>Dans ton message, indique ton pseudo, la date de l’achat, le nom de l’article et l’identifiant de transaction Tebex.</p>

    <h2>Problème de paiement</h2>
    <p>Les paiements sont traités par Tebex, vendeur et marchand of record. Pour une question de facturation, de moyen de paiement ou de remboursement, contacte le <a href="https://www.tebex.io/contact" target="_blank" rel="noopener noreferrer">support Tebex</a>.</p>
    <p><a href="https://www.tebex.io" target="_blank" rel="noopener noreferrer">Site officiel Tebex</a></p>

    <h2>Confidentialité et droits (Loi 25)</h2>
    <p>Pour une demande d’accès, de rectification, de suppression, de portabilité, de retrait de consentement ou toute question relative à tes renseignements personnels, écris à ${emailLink(legalIdentity.privacyEmail)} en précisant ton pseudo Minecraft et l’objet « demande de confidentialité ».</p>
    <p>Tu peux aussi porter plainte auprès de la <a href="https://www.cai.gouv.qc.ca" target="_blank" rel="noopener noreferrer">Commission d’accès à l’information du Québec</a>.</p>

    <h2>Droit de la consommation</h2>
    <p>Pour une réclamation liée à un achat, tu peux communiquer avec l’<a href="https://www.opc.gouv.qc.ca" target="_blank" rel="noopener noreferrer">Office de la protection du consommateur du Québec</a>. Nos conditions et notre politique de remboursement ne limitent pas les droits impératifs prévus par la LPC.</p>

    <h2>Informations utiles</h2>
    <ul>
      <li>Serveur : TBNK-SMP</li>
      <li>Édition : Minecraft Java uniquement</li>
      <li>IP : play.tbnk-smp.com</li>
      <li>Discord : discord.gg/td98WkM7V5</li>
      <li>Langue du service : français</li>
    </ul>
  `
};
