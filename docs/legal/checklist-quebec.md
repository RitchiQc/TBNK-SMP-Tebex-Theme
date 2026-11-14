# Checklist légale Québec — avant mise en production

> Document de travail, pas un avis juridique. Faire valider par un avocat ou
> un conseiller juridique québécois.

## 1. Identité et contacts du commerçant (LPC)

- [ ] `NEXT_PUBLIC_LEGAL_NAME` : nom légal du commerçant.
- [ ] `NEXT_PUBLIC_LEGAL_ADDRESS` : adresse d'affaires.
- [ ] `NEXT_PUBLIC_LEGAL_PHONE` : téléphone.
- [ ] `NEXT_PUBLIC_SUPPORT_EMAIL` : courriel de support.
- [ ] `NEXT_PUBLIC_PRIVACY_EMAIL` : courriel pour les demandes de confidentialité.
- [ ] `NEXT_PUBLIC_PRIVACY_OFFICER` : titre/fonction du responsable Loi 25.
      L'art. 3.1 P-39.1 exige de publier le titre et les coordonnées : le nom
      personnel n'est pas requis (ex. : « Administrateur principal – TBNK-SMP »).
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
      (Vercel, Tebex, Discord, mc-heads, mcsrvstat, YouTube).
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
- [ ] Les avatars mc-heads ne sont chargés qu'avec consentement.
- [ ] Aucun outil d'analyse/publicité n'est ajouté sans consentement.

## 4. LPC — contrat à distance

- [ ] Description détaillée des articles et de leurs caractéristiques.
- [ ] Prix par article, frais connexes, taxes et total avant paiement.
- [ ] Possibilité d'accepter, corriger ou refuser avant la conclusion.
- [ ] Reçu/contrat écrit conservable et imprimable, transmis dans les 15 jours.
- [ ] Reçu en français avec toutes les mentions obligatoires.
- [ ] Droit de résolution expliqué ; remboursement dans les 15 jours si applicable.
- [ ] Conditions et politique de remboursement validées par un juriste.
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

## 6. Tebex et taxes

- [ ] Confirmer le rôle exact de Tebex (marchand of record) et les obligations
      d'affichage du commerçant.
- [ ] Vérifier la gestion TPS/TVQ avec Tebex et un comptable.
- [ ] Configurer la langue française du checkout et des reçus.
- [ ] Vérifier que le reçu contient : identité, adresse, date, description,
      prix, taxes, total, coordonnées et mentions d'annulation.
- [ ] Tester un achat réel et la livraison en jeu.
- [ ] Vérifier les moyens de paiement réellement activés.

## 7. Sécurité et exploitation

- [ ] `APP_ENV=production`, `TEBEX_PUBLIC_TOKEN`, `NEXT_PUBLIC_SITE_URL`,
      `COOKIE_SECRET` et champs légaux configurés dans Vercel.
- [ ] `ALLOW_DEMO` absent ou `false` en production.
- [ ] Preview Vercel protégée par Deployment Protection et `noindex`.
- [ ] Token Tebex de test séparé pour les previews.
- [ ] Sauvegarde/rollback et alertes de disponibilité.
- [ ] Procédure d'incident de confidentialité et de sécurité.
