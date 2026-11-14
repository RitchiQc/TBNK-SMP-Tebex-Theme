import type { LegalPage } from "./types";
import { emailLink, legalIdentity, operatorBlock } from "./helpers";

export const privacy: LegalPage = {
  slug: "privacy",
  title: "Politique de confidentialité",
  description:
    "Données collectées par la boutique TBNK-SMP, finalités, témoins et droits (Loi 25).",
  updated: "14 novembre 2026",
  html: `
    <h2>1. Responsable de la protection des renseignements personnels</h2>
    ${operatorBlock()}
    <p>Le responsable veille au respect de la Loi sur la protection des renseignements personnels dans le secteur privé (Loi 25). Tu peux le joindre pour toute question, demande d’accès ou plainte.</p>
    <p>TBNK-SMP est responsable des renseignements collectés par le site. Les renseignements de paiement sont traités par Tebex, vendeur et marchand of record.</p>
    <p>Tu peux également porter plainte auprès de la <a href="https://www.cai.gouv.qc.ca" target="_blank" rel="noopener noreferrer">Commission d’accès à l’information du Québec (CAI)</a>.</p>

    <h2>2. Données collectées</h2>
    <p>La boutique collecte uniquement les données nécessaires au panier, à la livraison et au support :</p>
    <ul>
      <li>pseudo Minecraft Java fourni lors de la connexion ;</li>
      <li>contenu du panier et identifiant de panier Tebex ;</li>
      <li>informations de transaction nécessaires au paiement et à la livraison, traitées par Tebex ;</li>
      <li>adresse IP, journaux serveur et horodatage pour la sécurité et le diagnostic ;</li>
      <li>choix de consentement aux témoins et contenus tiers.</li>
    </ul>
    <p>Les informations de carte bancaire ne sont jamais stockées par TBNK-SMP. Elles sont traitées directement par Tebex et ses prestataires de paiement.</p>

    <h2>3. Finalités et bases du traitement</h2>
    <ul>
      <li>afficher le catalogue, gérer le panier et associer un achat au bon pseudo (exécution du contrat) ;</li>
      <li>permettre le paiement, la livraison et le support (exécution du contrat) ;</li>
      <li>prévenir la fraude et assurer la sécurité du site (intérêt légitime) ;</li>
      <li>charger les contenus tiers (YouTube, avatars mc-heads) uniquement avec ton consentement.</li>
    </ul>
    <p>Nous ne vendons pas tes renseignements personnels et ne les utilisons pas pour de la publicité ciblée.</p>

    <h2>4. Consentement</h2>
    <p>Le consentement doit être libre, éclairé, manifeste et donné à des fins spécifiques. Pour les témoins et contenus tiers, il est recueilli via le bandeau de consentement. Tu peux le retirer ou le modifier à tout moment via « Gérer mes cookies » dans le footer.</p>
    <p>Les témoins strictement nécessaires au panier et à la sécurité ne dépendent pas du consentement, car ils sont indispensables au service demandé.</p>

    <h2 id="cookies">5. Témoins (cookies) et technologies de suivi</h2>
    <p>Seuls les témoins strictement nécessaires sont actifs par défaut. Les contenus tiers sont désactivés tant que tu ne les acceptes pas.</p>
    <ul>
      <li><strong>Panier et session</strong> — <code>tbnk_basket_ident</code> (ou <code>__Host-tbnk_basket_ident</code> en production), <code>tbnk_username</code>, <code>tbnk_pending_add</code> : fonctionnement du panier, 7 jours, httpOnly et SameSite=Lax.</li>
      <li><strong>Démo uniquement</strong> — <code>tbnk_mock_basket</code> : panier fictif en développement/préproduction, 7 jours.</li>
      <li><strong>Consentement</strong> — <code>tbnk_consent</code> : mémorise tes choix, 6 mois, SameSite=Lax.</li>
      <li><strong>Tebex.js</strong> — chargé uniquement lorsque tu cliques sur « Passer au paiement ». Tebex peut déposer ses propres témoins pour le paiement ; consulte la <a href="https://www.tebex.io/privacy" target="_blank" rel="noopener noreferrer">politique de Tebex</a>.</li>
      <li><strong>YouTube</strong> — une vidéo n’est chargée qu’après ton action ou ton consentement, via <code>youtube-nocookie.com</code>. Consulte la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">politique de Google</a>.</li>
      <li><strong>Avatars Minecraft</strong> — chargés depuis <code>mc-heads.net</code> uniquement si tu acceptes la catégorie « Avatars ». Sinon, les initiales sont affichées.</li>
    </ul>
    <p>Aucun outil de mesure d’audience ou de publicité n’est utilisé à ce jour. S’il est ajouté, il sera soumis au consentement préalable.</p>

    <h2>6. Tiers et communication hors Québec</h2>
    <p>Certains prestataires peuvent traiter des renseignements à l’extérieur du Québec :</p>
    <ul>
      <li><strong>Tebex</strong> — paiement, taxes, remboursements et livraison ;</li>
      <li><strong>Vercel</strong> — hébergement et journaux techniques ;</li>
      <li><strong>Discord</strong> — communauté et support, si tu rejoins le serveur ;</li>
      <li><strong>mc-heads.net</strong> — avatars Minecraft, avec consentement ;</li>
      <li><strong>mcsrvstat.us</strong> — statut public du serveur ;</li>
      <li><strong>YouTube/Google</strong> — vidéos, avec consentement.</li>
    </ul>
    <p>Avant toute communication hors Québec, une évaluation des facteurs relatifs à la vie privée (EFVP) est réalisée et des mesures contractuelles raisonnables sont recherchées. Les liens vers leurs politiques sont fournis ci-dessus lorsque disponible.</p>

    <h2>7. Conservation et destruction</h2>
    <p>Les témoins de panier et de pseudo sont conservés jusqu’à 7 jours. Le choix de consentement est conservé 6 mois. Les journaux techniques sont conservés pour une durée limitée compatible avec la sécurité et le diagnostic. Les données de transaction sont conservées par Tebex selon ses obligations légales et comptables. Les données qui ne sont plus nécessaires sont détruites de façon sécuritaire.</p>

    <h2>8. Tes droits</h2>
    <p>Selon la Loi 25, tu peux demander l’accès à tes renseignements, leur rectification, leur suppression (sous réserve des obligations légales), leur portabilité dans un format technologique structuré et couramment utilisé, le retrait de ton consentement, ainsi que la désindexation ou la cessation de diffusion d’un renseignement dans les cas prévus par la loi.</p>
    <p>Adresse ta demande à ${emailLink(legalIdentity.privacyEmail)} en précisant ton pseudo Minecraft. Nous répondons dans les délais prévus par la loi. Pour les données de paiement, tu peux aussi contacter Tebex.</p>

    <h2>9. Mineurs de moins de 14 ans</h2>
    <p>Les renseignements personnels concernant un mineur de moins de 14 ans ne sont pas recueillis sans le consentement du titulaire de l’autorité parentale ou du tuteur, sauf dans les cas permis par la loi. Si tu es mineur, demande à ton parent ou tuteur de lire cette politique et les conditions avant tout achat.</p>

    <h2>10. Incidents de confidentialité</h2>
    <p>En cas d’incident impliquant un renseignement personnel et présentant un risque de préjudice sérieux, nous prenons des mesures raisonnables pour réduire le risque et éviter qu’il ne se reproduise, et nous notifions la CAI ainsi que les personnes concernées lorsque la loi l’exige. Un registre des incidents est tenu.</p>

    <h2>11. Sécurité</h2>
    <p>Nous mettons en œuvre des mesures raisonnables : HTTPS, cookies signés et httpOnly, validation des entrées, contrôle des accès, journalisation limitée et mise à jour des dépendances. Aucun système n’étant infaillible, nous ne pouvons garantir une sécurité absolue.</p>

    <h2>12. Contact et modifications</h2>
    <p>Pour toute question : ${emailLink(legalIdentity.privacyEmail)} ou via le <a href="https://discord.gg/td98WkM7V5" target="_blank" rel="noopener noreferrer">Discord officiel TBNK-SMP</a>. Cette politique peut être mise à jour ; la date ci-dessus indique la dernière version.</p>
  `
};
