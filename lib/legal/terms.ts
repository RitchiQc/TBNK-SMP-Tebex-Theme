import type { LegalPage } from "./types";
import { contactBlock, emailLink, legalIdentity } from "./helpers";

export const terms: LegalPage = {
  slug: "terms",
  title: "Conditions d’utilisation",
  description:
    "Conditions d’achat et d’utilisation de la boutique et du serveur TBNK-SMP.",
  updated: "14 novembre 2026",
  html: `
    <h2>1. Identité du commerçant et objet</h2>
    ${contactBlock()}
    <p>Les présentes conditions encadrent l’utilisation du site de la boutique TBNK-SMP et l’achat d’articles numériques pour le serveur Minecraft Java TBNK-SMP. Elles s’appliquent aux consommateurs du Québec et ne limitent pas les droits impératifs prévus par la Loi sur la protection du consommateur (LPC).</p>
    <p>En utilisant le site ou en effectuant un achat, tu acceptes ces conditions. Si tu ne les acceptes pas, tu ne dois pas utiliser la boutique.</p>

    <h2>2. Âge et mineurs</h2>
    <p>Tu dois avoir au moins 14 ans pour utiliser la boutique de façon autonome. Si tu as moins de 14 ans, un parent ou tuteur doit consentir à la collecte de tes renseignements personnels et à l’achat, conformément à la Loi 25. Le parent ou tuteur demeure responsable du compte et des achats du mineur.</p>

    <h2>3. Compte et pseudo Minecraft</h2>
    <p>Pour associer un achat à ton compte, tu dois fournir un pseudo Minecraft Java valide. Ce pseudo est utilisé pour identifier la livraison en jeu. Tu es responsable de l’exactitude du pseudo fourni.</p>
    <p>Un pseudo erroné peut empêcher ou retarder la livraison. Contacte le support si tu constates une erreur. Aucun mot de passe Minecraft ne t’est demandé par le site.</p>

    <h2>4. Achats, prix et paiements</h2>
    <p>Les paiements sont traités par <strong>Tebex</strong>, qui agit comme revendeur officiel et marchand of record. Tebex gère la transaction, les taxes applicables, la sécurité du paiement et les remboursements.</p>
    <p>Les prix sont affichés en dollars canadiens (CAD). Sauf indication contraire, les taxes applicables sont calculées et affichées sur la page de paiement Tebex avant la confirmation. Le prix total à payer est confirmé sur cette page. Si un prix affiché est erroné, le prix annoncé le plus bas prévaut dans la mesure permise par la LPC.</p>
    <p>TBNK-SMP n’est ni affilié ni sponsorisé par Mojang Studios ou Microsoft.</p>

    <h2>5. Abonnements</h2>
    <p>Les abonnements sont récurrents et gérés par Tebex. La période, le montant récurrent et les modalités d’annulation sont confirmés sur la page de paiement. Tu peux annuler selon les modalités indiquées par Tebex ; l’annulation met fin aux renouvellements futurs et ne rembourse pas automatiquement la période en cours, sous réserve de la LPC.</p>

    <h2>6. Livraison</h2>
    <p>Les articles numériques éligibles sont livrés automatiquement en jeu après confirmation du paiement, généralement en quelques secondes. La livraison dépend de la configuration du serveur et du package acheté. Certains articles peuvent nécessiter que tu sois connecté au serveur ou être livrés à la prochaine connexion.</p>
    <p>Si un achat n’apparaît pas, contacte le support avec ton pseudo, la date et l’identifiant de transaction. Nous vérifierons la commande et la livraison.</p>

    <h2>7. Contrat à distance, reçu et annulation</h2>
    <p>Conformément à la LPC, les renseignements essentiels sont fournis avant la conclusion du contrat et le paiement est confirmé sur la page Tebex. Un exemplaire écrit du contrat (reçu Tebex) doit pouvoir être conservé et imprimé. Si tu ne le reçois pas dans les 15 jours, contacte le support : la LPC peut prévoir un délai de résolution supplémentaire.</p>
    <p>Si le commerçant ne respecte pas certaines obligations prévues par la LPC, tu peux avoir le droit de résoudre le contrat sans frais. Ces droits ne peuvent pas être supprimés par la présente politique. Voir aussi la <a href="/legal/refund">politique de remboursement</a>.</p>

    <h2>8. Règles du serveur</h2>
    <p>L’achat d’un article ne dispense pas du respect des règles du serveur. Un compte banni ou sanctionné peut perdre l’accès à certains avantages, sans que cela ouvre automatiquement droit à un remboursement, sous réserve des droits impératifs applicables.</p>
    <p>La triche, l’exploitation de bugs, la revente non autorisée d’avantages et tout comportement nuisible peuvent entraîner des sanctions.</p>

    <h2>9. Disponibilité et modifications</h2>
    <p>Le serveur et la boutique peuvent être interrompus pour maintenance, mise à jour ou raisons techniques. Les articles, prix et avantages peuvent évoluer. Les avantages déjà achetés restent soumis aux règles et à la durée indiquée lors de l’achat.</p>

    <h2>10. Responsabilité</h2>
    <p>Dans les limites permises par la loi, TBNK-SMP ne peut être tenu responsable des interruptions, pertes de données, sanctions liées au non-respect des règles ou dommages indirects liés à l’utilisation du serveur ou de la boutique. Les paiements et remboursements sont gérés par Tebex selon ses conditions et la LPC.</p>

    <h2>11. Langue et droit applicable</h2>
    <p>Les présentes conditions, les factures et les reçus destinés aux consommateurs sont disponibles en français. Le site et le service à la clientèle sont offerts en français. Les parties reconnaissent que les lois du Québec s’appliquent, sans priver le consommateur des protections impératives de sa juridiction de résidence.</p>

    <h2>12. Contact et réclamations</h2>
    <p>Pour toute question ou réclamation : ${emailLink(legalIdentity.supportEmail)} ou via le <a href="https://discord.gg/td98WkM7V5" target="_blank" rel="noopener noreferrer">Discord officiel TBNK-SMP</a>. Tu peux aussi communiquer avec l’<a href="https://www.opc.gouv.qc.ca" target="_blank" rel="noopener noreferrer">Office de la protection du consommateur du Québec</a>.</p>
  `
};
