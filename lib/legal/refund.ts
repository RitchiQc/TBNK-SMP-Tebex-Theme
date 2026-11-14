import type { LegalPage } from "./types";
import { emailLink, legalIdentity, seller } from "./helpers";

export const refund: LegalPage = {
  slug: "refund",
  title: "Politique de remboursement",
  description:
    "Conditions de remboursement et droits du consommateur pour les articles numériques TBNK-SMP livrés instantanément en jeu.",
  updated: "14 novembre 2026",
  html: `
    <h2>1. Principe, livraison instantanée et droits impératifs</h2>
    <p>Les articles proposés sur la boutique TBNK-SMP (rangs, clés, cosmétiques et boosters) sont vendus par <strong>Tebex</strong>, vendeur et marchand of record. Ce sont des biens numériques livrés automatiquement en jeu dès la confirmation du paiement. Un article est considéré comme livré et réclamé au moment de sa livraison en jeu : il ne peut alors plus être « retourné » ni remboursé, sauf dans les cas prévus ci-dessous ou lorsqu’un droit impératif s’applique.</p>
    <p>Cette règle ne limite toutefois pas les droits impératifs prévus par la Loi sur la protection du consommateur (LPC). Les demandes de remboursement sont traitées par Tebex dans le cadre de ses conditions et de la loi applicable. Le contrat de vente est conclu exclusivement avec Tebex.</p>

    <h2>2. Droit de résolution prévu par la LPC</h2>
    <p>Si les obligations prévues par la LPC ne sont pas respectées (renseignements obligatoires, contrat écrit, livraison, etc.), tu peux avoir le droit de résoudre le contrat sans frais. Si un exemplaire écrit du contrat ne t’est pas transmis dans le délai prévu, la LPC peut porter le délai de résolution à 30 jours à compter de la conclusion du contrat. En cas de résolution, le remboursement des sommes payées doit être effectué dans les 15 jours suivant l’annulation, selon la LPC.</p>

    <h2>3. Exceptions : cas pouvant donner lieu à un remboursement</h2>
    <ul>
      <li>paiement effectué deux fois pour la même commande ;</li>
      <li>article payé mais non livré après vérification technique ;</li>
      <li>problème technique empêchant l’accès ou l’utilisation normale du produit acheté ;</li>
      <li>erreur de prix ou de description manifeste ;</li>
      <li>obligation légale applicable, notamment la LPC.</li>
    </ul>

    <h2>4. Cas généralement exclus, sous réserve de la loi</h2>
    <ul>
      <li>article, rang ou avantage déjà livré, appliqué ou réclamé en jeu ;</li>
      <li>clé ou coffre déjà ouvert, utilisé ou consommé ;</li>
      <li>changement d’avis après livraison ;</li>
      <li>pseudo Minecraft incorrect fourni par l’acheteur ;</li>
      <li>sanction ou bannissement lié au non-respect des règles du serveur ;</li>
      <li>achat effectué par un tiers avec le compte du joueur ;</li>
      <li>arrêt ou fermeture du serveur, sous réserve des droits impératifs applicables.</li>
    </ul>
    <p>Les articles sont virtuels, n’ont aucune valeur monétaire réelle et ne peuvent pas être échangés contre de l’argent réel. Ces exclusions ne s’appliquent pas lorsqu’un droit impératif de la LPC ou d’une autre loi applicable te donne droit à un remboursement.</p>

    <h2>5. Politique appliquée par Tebex</h2>
    <p>La boutique applique la politique de remboursement <strong>« No Refunds »</strong> de Tebex : les ventes sont finales, sauf si le produit n’a pas été livré ou si un problème technique empêche d’y accéder. Tebex, vendeur et marchand of record, traite les demandes de remboursement selon ses conditions et la loi applicable. Cette politique ne limite pas les droits impératifs prévus par la LPC.</p>
    <p>Consulte les <a href="${seller.termsUrl}" target="_blank" rel="noopener noreferrer">conditions de vente Tebex</a> et le <a href="${seller.supportUrl}" target="_blank" rel="noopener noreferrer">support Tebex</a>.</p>

    <h2>6. Comment faire une demande</h2>
    <p>Écris à ${emailLink(legalIdentity.supportEmail)} ou ouvre un ticket sur le <a href="https://discord.gg/td98WkM7V5" target="_blank" rel="noopener noreferrer">Discord officiel TBNK-SMP</a> avec :</p>
    <ul>
      <li>ton pseudo Minecraft ;</li>
      <li>la date et l’heure de l’achat ;</li>
      <li>l’identifiant de transaction Tebex ou la référence de commande ;</li>
      <li>une description précise du problème.</li>
    </ul>
    <p>Nous vérifions la livraison en jeu et transmettons la demande à Tebex, qui traite le remboursement. Tu peux aussi contacter directement le <a href="${seller.supportUrl}" target="_blank" rel="noopener noreferrer">support Tebex</a>.</p>

    <h2>7. Reçu et contrat</h2>
    <p>Le reçu Tebex constitue l’exemplaire écrit du contrat à conserver. S’il ne contient pas les mentions requises ou si tu ne le reçois pas dans les 15 jours, contacte le support afin que nous puissions corriger la situation.</p>

    <h2>8. Chargebacks</h2>
    <p>Un chargeback ouvert sans tentative de résolution amiable peut entraîner la suspension des avantages achetés et du compte concerné, dans l’attente de la résolution. Cette mesure ne limite pas les recours prévus par la loi.</p>

    <h2>9. Contact</h2>
    <p>Pour toute question : ${emailLink(legalIdentity.supportEmail)} ou via le <a href="https://discord.gg/td98WkM7V5" target="_blank" rel="noopener noreferrer">Discord TBNK-SMP</a>. Pour les questions de paiement, tu peux aussi contacter le <a href="${seller.supportUrl}" target="_blank" rel="noopener noreferrer">support Tebex</a> ou l’<a href="https://www.opc.gouv.qc.ca" target="_blank" rel="noopener noreferrer">Office de la protection du consommateur</a>.</p>
  `
};
