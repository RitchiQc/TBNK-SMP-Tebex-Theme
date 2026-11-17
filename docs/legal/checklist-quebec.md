# Checklist légale Québec — avant mise en production

> Document de travail, pas un avis juridique. Faire valider par un avocat ou
> un conseiller juridique québécois.

## 1. Identité et contacts du vendeur (LPC)

Par défaut, le vendeur des produits est **Tebex** (marchand of record) : le
contrat de vente est conclu exclusivement avec Tebex, qui affiche son identité
et ses conditions au checkout. Les champs `NEXT_PUBLIC_LEGAL_*` sont donc
**facultatifs** ; les remplir seulement si TBNK-SMP est le vendeur ou si l'OPC
l'exige.

- [ ] Afficher au footer, dans les conditions et dans la page contact que
      **Tebex est le vendeur et marchand of record**, avec un lien vers ses
      conditions et son support.
- [ ] `NEXT_PUBLIC_SUPPORT_EMAIL` : courriel de support.
- [ ] `NEXT_PUBLIC_PRIVACY_EMAIL` : courriel pour les demandes de confidentialité.
- [ ] `NEXT_PUBLIC_PRIVACY_OFFICER` : titre/fonction du responsable Loi 25.
      L'art. 3.1 P-39.1 exige de publier le titre et les coordonnées : le nom
      personnel n'est pas requis (ex. : « Administrateur principal – TBNK-SMP »).
- [ ] Facultatif — `NEXT_PUBLIC_LEGAL_NAME`, `NEXT_PUBLIC_LEGAL_ADDRESS`,
      `NEXT_PUBLIC_LEGAL_PHONE` : identité d'entreprise si TBNK-SMP est le
      vendeur (nom immatriculé, adresse professionnelle, téléphone d'affaires).
- [ ] Vérifier que ces informations apparaissent au footer, dans les conditions
      et dans la page contact avant le paiement.

Source : [OPC — Renseignements à donner avant un contrat à distance](https://www.opc.gouv.qc.ca/commercant/pratique-commerce/contrats-distance/renseignement-avant-contrat)

## 2. Loi 25 — gouvernance et transparence

- [ ] Désigner formellement le responsable de la protection des renseignements
      personnels (par défaut, la personne ayant la plus haute autorité ;
      délégation par écrit seulement).
- [ ] Publier le titre et les coordonnées du responsable sur le site Web
      (une boîte générique comme tbnksmp@gmail.com suffit si elle est
      réellement surveillée ; le nom personnel n'est pas exigé).
- [ ] Publier la politique de confidentialité complète, claire et datée.
- [ ] Rédiger une politique interne de gouvernance (conservation, destruction,
      rôles, plaintes).
- [ ] Tenir un registre des incidents de confidentialité.
- [ ] Prévoir une procédure de réponse aux demandes de droits (30 jours).
- [ ] Réaliser une EFVP pour le site et pour les transferts hors Québec
      (hébergeur — Vercel ou OVHcloud —, Tebex, Discord, mc-heads, mcsrvstat, YouTube).
- [ ] Prévoir le consentement parental pour les mineurs de moins de 14 ans.
- [ ] Documenter les mesures de sécurité et les accès aux données.

Sources :
- [CAI — Principaux changements de la Loi 25](https://www.cai.gouv.qc.ca/protection-renseignements-personnels/sujets-et-domaines-dinteret/principaux-changements-loi-25)
- [CAI — Responsable de la protection](https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees/responsable-protection-renseignements-personnels-entreprise)
- [CAI — Collecte et consentement](https://www.cai.gouv.qc.ca/protection-renseignements-personnels/information-entreprises-privees/collecte-renseignements-personnels_entreprises)

## 3. Témoins et consentement

- [ ] Seuls les témoins strictement nécessaires sont actifs par défaut.
- [ ] Le bandeau permet « Tout accepter », « Tout refuser » et la personnalisation.
- [ ] Le refus est aussi simple que l'acceptation.
- [ ] Le choix peut être modifié via « Gérer mes cookies ».
- [ ] Tebex.js n'est chargé qu'au clic de paiement.
- [ ] YouTube est en click-to-load / `youtube-nocookie.com`.
- [ ] Les avatars mc-heads sont proxifiés côté serveur (aucune requête directe du navigateur) et mis en cache.
- [ ] Aucun outil d'analyse/publicité n'est ajouté sans consentement.

## 4. LPC — contrat à distance

- [ ] Description détaillée des articles et de leurs caractéristiques.
- [ ] Prix par article, frais connexes, taxes et total avant paiement.
- [ ] Possibilité d'accepter, corriger ou refuser avant la conclusion.
- [ ] Reçu/contrat écrit conservable et imprimable, transmis dans les 15 jours.
- [ ] Reçu en français avec toutes les mentions obligatoires.
- [ ] Droit de résolution expliqué ; remboursement dans les 15 jours si applicable.
- [ ] Conditions et politique de remboursement validées par un juriste.
- [ ] Politique de remboursement Tebex réglée sur **« No Refunds »** (ventes
      finales ; exceptions Tebex : produit non livré ou problème technique), car
      les articles sont livrés instantanément en jeu. La page `/legal/refund`
      doit rester alignée sur ce choix.
- [ ] Moyens de paiement affichés uniquement s'ils sont réellement offerts par Tebex.

Sources :
- [OPC — Contenu et transmission du contrat](https://www.opc.gouv.qc.ca/commercant/pratique-commerce/contrats-distance/contenu)
- [OPC — Prix annoncé et promotion](https://www.opc.gouv.qc.ca/commercant/pratique-commerce/contrats-distance/prix-publicite-promotion/)
- [OPC — Annulation d'un contrat à distance](https://www.opc.gouv.qc.ca/commercant/pratique-commerce/contrats-distance/annulation)

## 5. Langue française (OQLF)

- [ ] Site, catalogue et publicités accessibles en français.
- [ ] Contrats, factures et reçus en français.
- [ ] Checkout Tebex configuré en français.
- [ ] Courriels de confirmation Tebex en français.
- [ ] Service à la clientèle en français.
- [ ] Si une version anglaise est ajoutée, version française complète et équivalente.

Source : [Gouvernement du Québec — Obligations en matière de langue française](https://www.quebec.ca/culture/langue-francaise/exercer-droits-langue-francaise/obligations)

## 6. Anonymat de l'exploitant (personne à son compte)

- **Loi 25** : le nom personnel du responsable n'a pas à être publié. Le titre
  (ex. « Administrateur principal – TBNK-SMP ») et un courriel fonctionnel
  suffisent (art. 3.1 P-39.1).
- **LPC** : l'identité du vendeur (nom, adresse, téléphone et, s'il y a lieu,
  courriel) doit être divulguée avant un contrat à distance. Par défaut, ce
  vendeur est Tebex. Il s'agit de l'identité de l'**entreprise**, pas
  nécessairement de la personne physique.
- **Entreprise individuelle** : l'immatriculation au REQ est obligatoire si
  l'entreprise est exploitée sous un nom qui ne comprend pas le nom de famille
  et le prénom du propriétaire (délai : 60 jours). Le registre est public : le
  nom du propriétaire et une adresse (domicile ou adresse professionnelle) y
  apparaissent. Une adresse professionnelle (bureau virtuel/coworking) peut
  protéger l'adresse personnelle ; une case postale n'est pas acceptée comme
  adresse professionnelle.
- **Solutions pour limiter l'exposition** : nom d'entreprise immatriculé,
  adresse professionnelle, numéro de téléphone VoIP et courriel dédié. Aucun
  anonymat complet n'est possible : une personne ou une entité doit demeurer
  imputable, et une fausse identité est une infraction.
- **Tebex** : selon les conditions de paiement Tebex, l'achat est conclu
  **exclusivement avec Tebex** (vendeur/marchand of record), et non avec
  l'exploitant de la plateforme. Une boutique peut donc présenter Tebex comme
  vendeur et ne publier, pour elle-même, que l'identité de l'exploitant du site
  requise par la Loi 25 (nom du site/organisation, titre du responsable,
  courriel). Cette approche doit être validée par un juriste et par Tebex ; sans
  cette validation, conserver une copie datée des conditions Tebex et documenter
  la décision. Le site ne doit pas induire en erreur et la Loi 25 s'applique à
  l'exploitant pour les données qu'il collecte lui-même (témoins, journaux,
  etc.).

Sources :
- [OPC — Renseignements à donner avant de conclure un achat à distance](https://www.opc.gouv.qc.ca/commercant/pratique-commerce/contrats-distance/renseignement-avant-contrat)
- [Québec.ca — Immatriculer une personne physique exploitant une entreprise individuelle](https://www.quebec.ca/entreprises-et-travailleurs-autonomes/demarrer-entreprise/immatriculer-constituer-entreprise/immatriculer-constituer-entreprise-formes-juridiques/personne-physique-entreprise-individuelle)
- [Tebex — Conditions de paiement](https://checkout.tebex.io/terms-us)
- [Tebex — Creator Agreement](https://www.tebex.io/terms-creator-agreement)

## 7. Tebex et taxes

- [ ] Confirmer au checkout Tebex que l'identité du vendeur (Tebex Limited ou
      Tebex Inc. selon le paiement), l'adresse, le téléphone/courriel et les
      conditions sont affichés avant le paiement.
- [ ] Vérifier la gestion TPS/TVQ avec Tebex et un comptable.
- [ ] Configurer la langue française du checkout et des reçus.
- [ ] Vérifier que la politique de remboursement affichée au checkout Tebex
      correspond à celle de `/legal/refund` (No Refunds, avec les exceptions).
- [ ] Vérifier que le reçu contient : identité, adresse, date, description,
      prix, taxes, total, coordonnées et mentions d'annulation.
- [ ] Tester un achat réel et la livraison en jeu.
- [ ] Vérifier les moyens de paiement réellement activés.

## 8. Sécurité et exploitation

- [ ] `APP_ENV=production`, `TEBEX_PUBLIC_TOKEN`, `NEXT_PUBLIC_SITE_URL`,
      `COOKIE_SECRET` et contacts de confidentialité configurés chez l’hébergeur (Vercel ou OVHcloud).
- [ ] `ALLOW_DEMO` absent ou `false` en production.
- [ ] Si OVHcloud au Québec : mettre à jour la politique de confidentialité,
      l’EFVP et la liste des tiers (hébergement Beauharnois, Canada).
- [ ] Preview/staging protégé (Vercel Deployment Protection ou accès restreint OVHcloud) et `noindex`.
- [ ] Token Tebex de test séparé pour les previews/staging.
- [ ] Sauvegarde/rollback et alertes de disponibilité.
- [ ] Procédure d'incident de confidentialité et de sécurité.
