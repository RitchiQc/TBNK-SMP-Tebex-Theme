import type { LegalPage } from "./types";

export const privacy: LegalPage = {
  slug: "privacy",
  title: "Politique de confidentialité",
  description:
    "Données collectées par la boutique TBNK-SMP, finalités et droits.",
  updated: "13 novembre 2026",
  html: `
    <h2>1. Données collectées</h2>
    <p>La boutique collecte uniquement les données nécessaires au fonctionnement du panier, à la livraison des achats et au support :</p>
    <ul>
      <li>pseudo Minecraft Java fourni lors de la connexion ;</li>
      <li>contenu du panier et identifiant de panier ;</li>
      <li>informations de transaction nécessaires au paiement, traitées par Tebex ;</li>
      <li>données techniques de base (adresse IP, logs serveur, horodatage) pour la sécurité et le diagnostic.</li>
    </ul>
    <p>Les informations de carte bancaire ne sont jamais stockées par TBNK-SMP. Elles sont traitées directement par Tebex et les prestataires de paiement.</p>

    <h2>2. Finalités</h2>
    <ul>
      <li>afficher le catalogue et gérer le panier ;</li>
      <li>associer un achat au bon compte Minecraft ;</li>
      <li>permettre le paiement et la livraison ;</li>
      <li>répondre aux demandes de support ;</li>
      <li>prévenir la fraude et assurer la sécurité du site.</li>
    </ul>

    <h2>3. Cookies</h2>
    <p>Le site utilise des cookies strictement nécessaires au fonctionnement du panier et de la session (identifiant de panier, pseudo, préférences). Ces cookies ne servent pas à de la publicité ciblée.</p>
    <p>Des services tiers peuvent déposer leurs propres cookies lors du paiement ou de l’intégration Discord. Consulte leurs politiques respectives.</p>

    <h2>4. Partage avec des tiers</h2>
    <ul>
      <li><strong>Tebex</strong> : paiement, taxes, remboursements et livraison ;</li>
      <li><strong>Discord</strong> : si tu rejoins le serveur Discord ;</li>
      <li><strong>Vercel</strong> : hébergement du site ;</li>
      <li><strong>mc-heads.net</strong> : affichage de l’avatar Minecraft ;</li>
      <li><strong>mcsrvstat.us</strong> : statut public du serveur Minecraft.</li>
    </ul>
    <p>Ces services peuvent être situés en dehors du Canada. En utilisant le site, tu reconnais que tes données peuvent être traitées selon leurs politiques respectives.</p>

    <h2>5. Conservation</h2>
    <p>Les cookies de panier sont conservés jusqu’à 7 jours. Les données de transaction sont conservées par Tebex selon ses obligations légales et comptables. Les logs techniques sont conservés pour une durée limitée, sauf obligation légale contraire.</p>

    <h2>6. Tes droits</h2>
    <p>Selon la législation applicable, tu peux demander l’accès, la correction ou la suppression de tes données, ou t’opposer à certains traitements. Contacte le support Discord en précisant ta demande et ton pseudo Minecraft.</p>
    <p>Pour les données liées au paiement, adresse-toi également à Tebex.</p>

    <h2>7. Sécurité</h2>
    <p>Nous mettons en œuvre des mesures raisonnables pour protéger les données. Aucun système n’étant infaillible, nous ne pouvons garantir une sécurité absolue.</p>

    <h2>8. Contact</h2>
    <p>Pour toute question liée à la confidentialité, rejoins le <a href="https://discord.gg/td98WkM7V5" target="_blank" rel="noopener noreferrer">Discord officiel TBNK-SMP</a>.</p>
  `
};
