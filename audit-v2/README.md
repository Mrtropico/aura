# Audit V2 — AURA

Dossier complémentaire à `audit/`, suite au pivot stratégique : AURA ne se positionne pas en SaaS national mais en **outil de coordination locale pour le tissu artistique et associatif toulousain**.

> Date de génération : 11 mai 2026

---

## 📂 Livrables

### 1. `CODE_INVENTORY.md` — Inventaire technique exhaustif
- Tableau complet des routes (statut fonctionnel/hardcodé/cassé)
- Composants partagés et leurs usages
- **Logique métier critique** avec extraits de code et bugs identifiés :
  - 🔴 Bug réserve fiscale (jamais calculée en prod, le slider est sur le mauvais formulaire)
  - 🔴 Bug colonne DB `creator_id` vs `profile_id` dans `useArtworks` (galerie cassée en prod)
  - 🔴 Bug colonne `seller_id` vs `profile_id` dans `useSales` (ventes cassées en prod)
  - Géocodage Nominatim : pas de debounce, pas de `User-Agent`, risque de ban
  - Subscriptions Realtime non filtrées par `profile_id`
- Pages hardcodées (Events, Workshops, sections de MemberHomePage)
- Mapping complet des tables Supabase ↔ fichiers de code (avec colonnes vérifiées en DB live)
- Dette technique : `any` types, console.error oubliés, code mort, doublons

### 2. `USER_STORIES_REELLES.md` — 8 personas du tissu local
Pour chaque persona du cercle réel du founder :
- Sa galère actuelle (sans AURA)
- Ce qu'il fait concrètement avec l'app (geste par geste)
- Le moment "déclic"
- **Ce qui lui manque** (basé sur lecture du code)

Personas couverts : artiste plasticien, organisateur métal, animatrice couture, radionaute, asso radio, asso DJ, asso maraude, logement artistes.

Synthèse stratégique avec questions de positionnement à trancher.

### 3. `FEATURES_GAP.md` — 14 idées évaluées
Pour chaque idée mentionnée :
- État actuel dans le code (✅/🚧/❌)
- Complexité (🟢🟡🔴)
- Approche d'implémentation (architecture, libs, schéma DB)
- Récap stratégique en tiers de priorité

### 4. `CONTEXTE_TOULOUSE.md` — Cartographie locale vérifiée
- Associations toulousaines actives (sources : HelloAsso, Gralon)
- Lieux de création (Mix'Art Myrys, Metronum, Bikini, Halle de la Machine, Quai des Savoirs…)
- Radios associatives (Radio FMR 89.1, Campus FM 94.0, Mon Païs, Présence)
- Outils déjà utilisés par le milieu (AlterWeb, Démosphère, Mobilizon, Toulouse Bouge, HelloAsso)
- Cibles partenariats prioritaires
- Toutes les sources sourcées en hyperlien

### 5. `screenshots/` — Captures bonus
Screenshots additionnels demandés. Voir détails ci-dessous.

### 6. Scripts (référence)
- `capture-bonus-screenshots.mjs` — Réutilisable pour régénérer les bonus

---

## 🖼️ Bonus screenshots capturés

| Fichier | Description |
|---|---|
| `B01-onboarding-disciplines-PROXY.png` | Proxy de l'onboarding "Votre Trace" (formulaire d'inscription — l'écran réel nécessite un compte vierge non confirmé) |
| `B02-dashboard-createur.png` | Tableau de bord créateur (`/dashboard`) avec KPIs et galerie récente |
| `B03-members-tableau.png` | Liste tableau complète des adhérents avec filtres |
| `B04-accounting-collectif.png` | Comptabilité du collectif (réutilise `FinancesPage`) |
| `B05-members-add-modal.png` | Modale d'ajout d'adhérent |
| `B06-modale-profil-artiste.png` | ⚠️ Non capturé : la DB démo n'avait pas de cards de profil visibles dans le réseau |

---

## 🎯 Top 3 actions à faire en priorité absolue

D'après `CODE_INVENTORY.md` :

1. **Fixer le bug `creator_id` → `profile_id` dans `useArtworks.ts` et `useSales.ts`** (5 minutes, mais critique : galerie et ventes ne fonctionnent PAS en production actuellement)

2. **Implémenter la création d'une finance `type='income'` à chaque vente** (`SaleForm.tsx`) pour que la réserve fiscale se calcule effectivement (30 minutes)

3. **Retirer le slider "Taux de réserve fiscale" du formulaire de Dépense** ou le déplacer au formulaire de Vente (5 minutes, source de confusion UX)

---

## 📋 Pour l'auditeur

L'ordre de lecture recommandé :

1. **`CODE_INVENTORY.md`** — pour comprendre l'état réel du produit (et les 3 bugs critiques)
2. **`USER_STORIES_REELLES.md`** — pour comprendre les vrais besoins terrain
3. **`CONTEXTE_TOULOUSE.md`** — pour comprendre l'écosystème dans lequel AURA s'inscrit
4. **`FEATURES_GAP.md`** — pour structurer la roadmap après le diagnostic

Les sections `[À COMPLÉTER PAR HAROLD]` ou `[À INTERVIEWER PAR HAROLD]` signalent ce qui n'a pas pu être déduit du code seul et nécessite une discussion directe avec le founder.

---

## ⚠️ Limitations connues de cet audit

- **Bonus screenshot B06 (modale profil artiste)** non capturé : aucun profil dans la DB démo ne déclenche la modale (data fictive limitée). À capturer manuellement par le founder en utilisant un compte avec œuvres réelles.
- **Section "Onboarding Votre Trace"** : capture remplacée par un proxy (formulaire d'inscription) car l'écran réel nécessite un compte vierge non confirmé. À capturer manuellement en créant un nouveau compte test.
- **Personas 4-8** : les sections "Sa galère actuelle" et "Ce qu'il fait avec AURA" sont des hypothèses raisonnables. À valider en interview directe avec les vraies personnes pour validation produit.
- **Liste d'associations toulousaines** : 4 assos identifiées avec certitude (Mix'Art Myrys, Fanfarnaüm, Kaonashi, ART-EXPRESSION) + 1000+ accessibles via les annuaires HelloAsso/Gralon mais non listées une à une.
