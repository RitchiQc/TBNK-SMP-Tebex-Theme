import type { LegalPage } from "./types";

export const refund: LegalPage = {
  slug: "refund",
  title: "Politique de remboursement",
  description:
    "Conditions de remboursement des articles numériques TBNK-SMP.",
  updated: "13 novembre 2026",
  html: `
    <h2>1. Principe</h2>
    <p>Les articles vendus sur la boutique TBNK-SMP sont des biens numériques livrés immédiatement en jeu. En raison de leur nature, ils ne peuvent pas être « retournés » une fois livrés.</p>
    <p>Les paiements sont traités par <strong>Tebex</strong>, marchand of record. Les demandes de remboursement sont donc examinées dans le cadre des conditions de Tebex et de la législation applicable.</p>

    <h2>2. Cas pouvant donner lieu à un remboursement</h2>
    <ul>
      <li>paiement effectué deux fois pour la même commande ;</li>
      <li>article payé mais non livré après vérification technique ;</li>
      <li>erreur de prix ou de description manifeste ;</li>
      <li>obligation légale applicable.</li>
    </ul>

    <h2>3. Cas généralement exclus</h2>
    <ul>
      <li>article déjà livré et utilisé ;</li>
      <li>changement d’avis après livraison ;</li>
      <li>pseudo Minecraft incorrect fourni par l’acheteur ;</li>
      <li>sanction ou bannissement lié au non-respect des règles du serveur ;</li>
      <li>achat effectué par un tiers avec le compte du joueur.</li>
    </ul>

    <h2>4. Comment faire une demande</h2>
    <p>Rejoins le <a href="https://discord.gg/td98WkM7V5" target="_blank" rel="noopener noreferrer">Discord officiel TBNK-SMP</a> et ouvre un ticket de support avec :</p>
    <ul>
      <li>ton pseudo Minecraft ;</li>
      <li>la date et l’heure de l’achat ;</li>
      <li>l’identifiant de transaction Tebex ou la référence de commande ;</li>
      <li>une description précise du problème.</li>
    </ul>
    <p>Nous vérifierons la commande et la livraison avant de transmettre la demande à Tebex si nécessaire.</p>

    <h2>5. Chargebacks</h2>
    <p>Un chargeback ouvert sans tentative de résolution amiable peut entraîner la suspension des avantages achetés et du compte concerné, dans l’attente de la résolution.</p>

    <h2>6. Contact</h2>
    <p>Pour toute question, utilise le <a href="https://discord.gg/td98WkM7V5" target="_blank" rel="noopener noreferrer">Discord TBNK-SMP</a>. Pour les questions de paiement, tu peux aussi contacter le <a href="https://www.tebex.io" target="_blank" rel="noopener noreferrer">support Tebex</a>.</p>
  `
};
