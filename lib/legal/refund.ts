import type { LegalPage } from "./types";
import { emailLink, legalIdentity } from "./helpers";

export const refund: LegalPage = {
  slug: "refund",
  title: "Politique de remboursement",
  description:
    "Conditions de remboursement et droits du consommateur pour les articles numériques TBNK-SMP.",
  updated: "14 novembre 2026",
  html: `
    <h2>1. Principe et droits impératifs</h2>
    <p>Les articles vendus sur la boutique TBNK-SMP sont des biens numériques livrés immédiatement en jeu. En raison de leur nature, ils ne peuvent pas être « retournés » une fois livrés. Cette règle ne limite toutefois pas les droits impératifs prévus par la Loi sur la protection du consommateur (LPC).</p>
    <p>Les paiements sont traités par <strong>Tebex</strong>, marchand of record. Les demandes de remboursement sont examinées dans le cadre des conditions de Tebex et de la loi applicable.</p>

    <h2>2. Droit de résolution prévu par la LPC</h2>
    <p>Si le commerçant ne respecte pas certaines obligations prévues par la LPC (renseignements obligatoires, contrat écrit, livraison, etc.), tu peux avoir le droit de résoudre le contrat sans frais. Si un exemplaire écrit du contrat ne t’est pas transmis dans le délai prévu, la LPC peut porter le délai de résolution à 30 jours à compter de la conclusion du contrat. En cas de résolution, le remboursement des sommes payées doit être effectué dans les 15 jours suivant l’annulation, selon la LPC.</p>

    <h2>3. Cas pouvant donner lieu à un remboursement</h2>
    <ul>
      <li>paiement effectué deux fois pour la même commande ;</li>
      <li>article payé mais non livré après vérification technique ;</li>
      <li>erreur de prix ou de description manifeste ;</li>
      <li>obligation légale applicable, notamment la LPC.</li>
    </ul>

    <h2>4. Cas généralement exclus, sous réserve de la loi</h2>
    <ul>
      <li>article déjà livré et utilisé ;</li>
      <li>changement d’avis après livraison ;</li>
      <li>pseudo Minecraft incorrect fourni par l’acheteur ;</li>
      <li>sanction ou bannissement lié au non-respect des règles du serveur ;</li>
      <li>achat effectué par un tiers avec le compte du joueur.</li>
    </ul>
    <p>Ces exclusions ne s’appliquent pas lorsqu’un droit impératif de la LPC ou d’une autre loi applicable te donne droit à un remboursement.</p>

    <h2>5. Comment faire une demande</h2>
    <p>Écris à ${emailLink(legalIdentity.supportEmail)} ou ouvre un ticket sur le <a href="https://discord.gg/td98WkM7V5" target="_blank" rel="noopener noreferrer">Discord officiel TBNK-SMP</a> avec :</p>
    <ul>
      <li>ton pseudo Minecraft ;</li>
      <li>la date et l’heure de l’achat ;</li>
      <li>l’identifiant de transaction Tebex ou la référence de commande ;</li>
      <li>une description précise du problème.</li>
    </ul>
    <p>Nous vérifierons la commande et la livraison avant de transmettre la demande à Tebex si nécessaire.</p>

    <h2>6. Reçu et contrat</h2>
    <p>Le reçu Tebex constitue l’exemplaire écrit du contrat à conserver. S’il ne contient pas les mentions requises ou si tu ne le reçois pas dans les 15 jours, contacte le support afin que nous puissions corriger la situation.</p>

    <h2>7. Chargebacks</h2>
    <p>Un chargeback ouvert sans tentative de résolution amiable peut entraîner la suspension des avantages achetés et du compte concerné, dans l’attente de la résolution. Cette mesure ne limite pas les recours prévus par la loi.</p>

    <h2>8. Contact</h2>
    <p>Pour toute question : ${emailLink(legalIdentity.supportEmail)} ou via le <a href="https://discord.gg/td98WkM7V5" target="_blank" rel="noopener noreferrer">Discord TBNK-SMP</a>. Pour les questions de paiement, tu peux aussi contacter le <a href="https://www.tebex.io" target="_blank" rel="noopener noreferrer">support Tebex</a> ou l’<a href="https://www.opc.gouv.qc.ca" target="_blank" rel="noopener noreferrer">Office de la protection du consommateur</a>.</p>
  `
};
