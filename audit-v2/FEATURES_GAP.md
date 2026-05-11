# FEATURES GAP — L'Atelier / AURA v5
*Évaluation des 14 idées de fonctionnalités — état actuel dans le code + complexité d'implémentation*

---

## #1 — Bouton "J'y vais" / "Ça m'intéresse" sur les événements carte

**État actuel :** ❌ Pas du tout
**Complexité :** 🟢 Facile (2–3h)

**Dans le code :** Aucune table `attendance` ou `interest` n'existe dans `supabase_schema.sql`. Les pins de `map_activities` n'ont pas de compteur.

**Comment s'y prendre :**
1. Ajouter une table SQL : `create table map_attendances (activity_id uuid, user_id uuid, primary key (activity_id, user_id))`
2. Dans le panneau latéral `selectedPin` de `MapPage.tsx` (lignes 290–340), ajouter un bouton qui fait un `insert` ou `delete` dans cette table
3. Afficher le compteur avec un `count` Supabase en temps réel

---

## #2 — Génération d'un visuel partageable Instagram

**État actuel :** ❌ Pas du tout
**Complexité :** 🔴 Complexe (2–3 jours)

**Dans le code :** Aucune infrastructure de génération d'image. L'app n'a pas de canvas HTML ni d'appel à une API d'image.

**Comment s'y prendre :**
Option A (client) : Utiliser `html2canvas` ou `@html-to-image` pour capturer un composant React stylé (fond de couleur, nom de l'event, date, logo asso) et générer un `.png` téléchargeable.
Option B (serveur) : Supabase Edge Function qui appelle l'API Puppeteer/Playwright ou Satori (Vercel) pour rendre un template JSX en PNG.
L'option A est suffisante pour un MVP. Le template doit être un composant React dédié de 1080×1080px caché dans le DOM.

---

## #3 — Filtre de la carte par discipline

**État actuel :** 🚧 Partiellement — il y a 5 types de pins (exposition, performance, atelier_ouvert, rencontre_flash, autre) mais pas de filtre UI

**Complexité :** 🟢 Facile (1–2h)

**Dans le code :** `MapPage.tsx` charge tous les `map_activities` sans filtre. Il n'y a pas de barre de filtre.

**Comment s'y prendre :**
Ajouter un state `activeFilters: Set<string>` dans `MapPage`. Ajouter 5 toggle buttons en overlay sur la carte (déjà prévu dans le design du Master Prompt). Filtrer `activities` avant de les passer aux `<Marker>`.

---

## #4 — Mini-CRM contacts pour les artistes (qui a acheté quoi)

**État actuel :** 🚧 Partiellement — `sales` table a `buyer_name_free` et `buyer_member_id`, mais pas de vue CRM dédiée

**Complexité :** 🟡 Moyen (1 journée)

**Dans le code :** `useSales.ts` lit la table `sales` avec `buyer_name_free`. Il n'y a pas de page ou composant "Carnet de contacts acheteurs". `NetworkPage` liste d'autres artistes/assos mais pas les acheteurs d'une personne.

**Comment s'y prendre :**
1. Ajouter une table `contacts` (ou enrichir `sales` avec plus de champs acheteur)
2. Créer un onglet "Contacts" dans `FinancesPage` ou une nouvelle route `/contacts`
3. Agréger les sales par `buyer_name_free`, afficher le total acheté, la dernière date, une note libre

---

## #5 — Section radio (passages radio sur la carte)

**État actuel :** ❌ Pas du tout
**Complexité :** 🟡 Moyen (1 journée)

**Dans le code :** Le type de pin `map_activities.type` accepte : `exposition | performance | atelier_ouvert | rencontre_flash | autre`. Pas de type `radio`. Le profil n'a pas de champ `radio_frequency` ou `streaming_url`.

**Comment s'y prendre :**
1. Ajouter `radio` dans l'enum des types de pins (migration SQL + enum côté front dans `MapPage.tsx` ligne 31)
2. Ajouter `streaming_url` et `frequency` dans la table `map_activities` (optionnels)
3. Ajouter ces champs dans le formulaire "Nouvelle épingle" avec un affichage conditionnel sur le type `radio`
4. Ajouter un icône spécifique radio dans `ICONS` (MapPage.tsx ligne 31)

---

## #6 — Annuaire pré-rempli d'assos (sans inscription)

**État actuel :** ❌ Pas du tout
**Complexité :** 🟡 Moyen (1 journée)

**Dans le code :** Toutes les assos dans `NetworkPage` sont des vrais profils Supabase (`is_association: true`). Il n'y a pas de concept d'"asso non-inscrite / répertoire externe".

**Comment s'y prendre :**
1. Créer une table `directory_entries` avec `name`, `category`, `city`, `website`, `description`, `is_claimed` (boolean)
2. Créer une page `/annuaire` accessible sans authentification
3. Quand une asso s'inscrit, proposer de "réclamer" son entrée existante dans le répertoire
4. Alimenter manuellement les 20–30 premières assos toulousaines (cf. `CONTEXTE_TOULOUSE.md`)

---

## #7 — Page "Aujourd'hui à Toulouse"

**État actuel :** ❌ Pas du tout
**Complexité :** 🟢 Facile (2–3h)

**Dans le code :** La MapPage charge tous les `map_activities` sans filtre temporel. Il n'y a pas de vue "événements du jour".

**Comment s'y prendre :**
1. Requête Supabase : `.from('map_activities').select('*').gte('start_date', today_start).lte('start_date', today_end).order('start_date')`
2. Créer un composant `TodayFeed` (ou une section dans `NetworkPage`) qui affiche ces 3 prochains events sous forme de cards verticales avec distance GPS si disponible
3. Peut être la page d'accueil `/` à la place de la carte — ou un widget en overlay sur la carte

---

## #8 — Notification push web "nouvel event d'une asso suivie"

**État actuel :** ❌ Pas du tout
**Complexité :** 🔴 Complexe (2–3 jours)

**Dans le code :** Aucune infrastructure de notifications. Pas de Service Worker, pas de table `push_subscriptions`, pas d'Edge Function dédiée.

**Comment s'y prendre :**
1. Enregistrer un Service Worker avec l'API Web Push (VAPID keys)
2. Stocker les `PushSubscription` dans une table Supabase `push_subscriptions(user_id, subscription_json)`
3. Créer une Supabase Edge Function déclenchée par un trigger DB sur `INSERT INTO map_activities`
4. L'Edge Function récupère les followers du `creator_id`, envoie une notification via l'API Web Push

---

## #9 — Affiliations entre assos (réseau de partenaires)

**État actuel :** ❌ Pas du tout
**Complexité :** 🟡 Moyen (1 journée)

**Dans le code :** La table `follows` gère les suivis individuels artiste↔asso mais pas les partenariats formels entre assos.

**Comment s'y prendre :**
1. Créer une table `asso_partnerships(asso_a uuid, asso_b uuid, label text, created_at)` — relation symétrique
2. Dans le profil asso (modal ou page `/asso/:id`), afficher une section "Partenaires" avec les logos et liens
3. Permettre à une asso de "déclarer" un partenariat — l'autre asso doit confirmer (workflow similaire à `follows`)

---

## #10 — Statut "Atelier ouvert maintenant" (épingle temporaire 2h)

**État actuel :** 🚧 Partiellement — la feature "Rencontre Flash" (`rencontre_flash`) existe et permet de définir une durée (1h, 2h, 3h, 6h, 12h). Mais le libellé est "Rencontre Flash" et non "Atelier Ouvert".

**Complexité :** 🟢 Facile (1h)

**Dans le code :** `MapPage.tsx` lignes 166–202 : `handleAddFlash()` insère avec `type: 'rencontre_flash'` et calcule `end_date` automatiquement. La feature existe déjà conceptuellement.

**Comment s'y prendre :**
1. Dans le formulaire Flash, ajouter une option "Atelier ouvert en ce moment" comme type dédié
2. OU renommer "Rencontre Flash" en "Présence Flash" et ajouter un sous-type dans les métadonnées
3. La carte devrait filtrer les pins expirés (`end_date < now()`) — **non implémenté actuellement**

---

## #11 — Export PDF de la compta pour les artistes

**État actuel :** ❌ Pas du tout
**Complexité :** 🟡 Moyen (1 journée)

**Dans le code :** `FinancesPage.tsx` affiche une liste combinée `sales + finances` mais sans export. Aucune dépendance PDF dans `package.json`.

**Comment s'y prendre :**
1. Installer `jspdf` + `jspdf-autotable` (librairie front, ~100kB)
2. Créer un bouton "Exporter PDF" dans `FinancesPage.tsx`
3. Générer un tableau avec colonnes : date, description, type, montant, réserve calculée, net
4. Ajouter un header avec nom de l'artiste, période, totaux
5. `doc.save('compta-{mois}-{annee}.pdf')`

---

## #12 — Récap mensuel automatique par mail

**État actuel :** ❌ Pas du tout
**Complexité :** 🔴 Complexe (2 jours)

**Dans le code :** Aucune infrastructure d'emails transactionnels. Pas d'intégration Resend/Sendgrid. Aucune Supabase Edge Function planifiée (cron).

**Comment s'y prendre :**
1. Intégrer Resend (ou Supabase built-in email) pour les emails transactionnels
2. Créer une Supabase Edge Function `monthly-recap` qui :
   - Calcule les totaux du mois passé pour chaque artiste (`finances + sales`)
   - Envoie un email HTML avec : CA du mois, dépenses, réserve constituée, net estimé, comparaison mois précédent
3. Planifier via Supabase Cron : `0 9 1 * *` (le 1er de chaque mois à 9h)

---

## #13 — Modèles de documents asso (statuts, RI, AG)

**État actuel :** ❌ Pas du tout
**Complexité :** 🟢 Facile (2–3h) — si on se limite à du téléchargement de templates statiques

**Dans le code :** Aucune section "Ressources" ou "Documents". Pas de stockage de fichiers templates.

**Comment s'y prendre :**
Option A (simple) : Créer une page `/ressources` avec des liens vers des templates Word/PDF hébergés dans Supabase Storage (bucket public `templates`). Pas de génération dynamique.
Option B (avancé) : Utiliser `docxtemplater` pour générer des statuts pré-remplis avec le nom de l'asso, la date, le nom du président. Nécessite une Edge Function.

**Recommandation MVP :** Option A. 5 templates PDF statiques suffisent pour 80% des besoins : statuts-type, RI-type, PV d'AG, bilan financier annuel, reçu de cotisation.

---

## #14 — Liens "j'ai joué pour / ils ont joué chez nous"

**État actuel :** ❌ Pas du tout
**Complexité :** 🔴 Complexe (2–3 jours)

**Dans le code :** Aucune table de collaboration. `follows` est une relation de suivi, pas de collaboration documentée.

**Comment s'y prendre :**
1. Créer une table `collaborations(id, initiator_id, partner_id, event_name, event_date, role_initiator, role_partner, confirmed bool)`
2. Permettre à un artiste de déclarer "J'ai joué pour [asso X] le [date]" — l'asso confirme
3. Dans les profils (modal `ArtistProfileModal` de `NetworkPage.tsx`), afficher une section "Collaborations" avec les assos/artistes liés
4. Créer une vue réseau/graphe optionnelle pour visualiser les connexions (bibliothèque `d3-force` ou `react-flow`)

---

## Tableau récapitulatif de priorisation

| # | Feature | État | Complexité | Valeur utilisateur |
|---|---------|------|------------|-------------------|
| 3 | Filtre carte par discipline | 🚧 | 🟢 1–2h | ⭐⭐⭐⭐⭐ |
| 1 | Bouton "J'y vais" | ❌ | 🟢 2–3h | ⭐⭐⭐⭐ |
| 10 | "Atelier ouvert maintenant" | 🚧 | 🟢 1h | ⭐⭐⭐⭐ |
| 7 | "Aujourd'hui à Toulouse" | ❌ | 🟢 2–3h | ⭐⭐⭐⭐⭐ |
| 11 | Export PDF compta | ❌ | 🟡 1j | ⭐⭐⭐⭐ |
| 5 | Section radio | ❌ | 🟡 1j | ⭐⭐⭐ |
| 4 | Mini-CRM acheteurs | 🚧 | 🟡 1j | ⭐⭐⭐ |
| 6 | Annuaire pré-rempli | ❌ | 🟡 1j | ⭐⭐⭐⭐ |
| 9 | Affiliations entre assos | ❌ | 🟡 1j | ⭐⭐⭐ |
| 13 | Templates documents | ❌ | 🟢 2–3h | ⭐⭐⭐ |
| 2 | Visuel Instagram | ❌ | 🔴 2–3j | ⭐⭐⭐ |
| 12 | Récap mensuel mail | ❌ | 🔴 2j | ⭐⭐⭐ |
| 8 | Notifications push | ❌ | 🔴 2–3j | ⭐⭐⭐ |
| 14 | Graphe collaborations | ❌ | 🔴 2–3j | ⭐⭐ |
