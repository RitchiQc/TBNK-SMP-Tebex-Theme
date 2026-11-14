import type { LegalPage } from "./types";

export const contact: LegalPage = {
  slug: "contact",
  title: "Contact & support",
  description:
    "Contacter le support de la boutique et du serveur TBNK-SMP.",
  updated: "13 novembre 2026",
  html: `
    <h2>Support TBNK-SMP</h2>
    <p>Le support officiel se fait sur Discord. C’est le moyen le plus rapide pour obtenir de l’aide sur un achat, une livraison ou un problème en jeu.</p>
    <p><a href="https://discord.gg/td98WkM7V5" target="_blank" rel="noopener noreferrer">Rejoindre le Discord TBNK-SMP</a></p>

    <h2>Problème de livraison</h2>
    <p>Avant d’ouvrir un ticket, vérifie que :</p>
    <ul>
      <li>tu as utilisé le bon pseudo Minecraft Java ;</li>
      <li>tu t’es connecté au serveur après l’achat ;</li>
      <li>le paiement a bien été confirmé par Tebex ;</li>
      <li>tu as attendu quelques minutes après la transaction.</li>
    </ul>
    <p>Dans ton ticket, indique ton pseudo, la date de l’achat, le nom de l’article et l’identifiant de transaction Tebex.</p>

    <h2>Problème de paiement</h2>
    <p>Les paiements sont traités par Tebex. Pour une question de facturation, de moyen de paiement ou de remboursement, contacte le support Tebex en plus du Discord TBNK-SMP.</p>
    <p><a href="https://www.tebex.io" target="_blank" rel="noopener noreferrer">Site officiel Tebex</a></p>

    <h2>Demandes légales</h2>
    <p>Pour une demande liée à la confidentialité ou à tes données, utilise le Discord et précise clairement « demande de confidentialité ». Nous te répondrons dans les meilleurs délais.</p>

    <h2>Informations utiles</h2>
    <ul>
      <li>Serveur : TBNK-SMP</li>
      <li>Édition : Minecraft Java uniquement</li>
      <li>IP : play.tbnk-smp.com</li>
      <li>Discord : discord.gg/td98WkM7V5</li>
    </ul>
  `
};
