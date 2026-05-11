# AURA — Brief Produit pour Audit Externe

> Document destiné à un auditeur (Steve Jobs / top ingé / top marketeur) qui n'a jamais vu l'application. Chaque section répond à une question précise pour permettre une revue produit complète : design, UX, parcours, naming, stratégie.

> **À lire en parallèle des screenshots** dans `audit/screenshots/`.

---

## A) Pitch en 1 phrase

> **AURA est la carte vivante de la création mondiale : créateurs, collectifs et explorateurs réunis sur une seule plateforme.**

(19 mots)

---

## B) La promesse principale

Les artistes indépendants et les collectifs culturels naviguent aujourd'hui entre Instagram (visibilité), Excel (compta), Eventbrite (événements) et leurs notes (adhérents). **AURA leur offre un seul outil qui fait tout** : portfolio public géolocalisé, gestion d'œuvres, finances simplifiées avec réserve fiscale automatique, et CRM associatif léger. La promesse : **arrêter de jongler entre 5 outils pour pouvoir créer, pas administrer.**

---

## C) Public cible

### Persona principal — "Léa, 32 ans, peintre indépendante"
- **Métier** : artiste plasticienne / peintre / graffeuse / photographe
- **Maturité artistique** : amateur éclairée à semi-professionnelle (vit partiellement de son art mais pas encore à 100%)
- **Contexte** : auto-entrepreneur ou en cours de structuration, vend quelques œuvres par an, expose dans des cafés, bars, ateliers ouverts
- **Pain points** : déteste la compta, ne sait jamais combien mettre de côté pour les charges, oublie de noter ses ventes, perd ses contacts d'acheteurs

### Persona secondaire 1 — "Le Collectif Abstrait"
- Petite association culturelle (10-50 adhérents), portée par 1-3 bénévoles surchargés
- Gère ses membres dans un Google Sheet, ses événements sur Facebook, sa caisse dans un cahier
- Cherche un outil simple, pas un ERP

### Persona secondaire 2 — "Maxime, 28 ans, explorateur curieux"
- Adhérent d'un collectif culturel, suit quelques artistes locaux
- Veut découvrir ce qui se passe près de chez lui ce week-end
- Pas créateur lui-même, mais consommateur de culture

### Là où ils sont aujourd'hui
- **Instagram** pour montrer leurs œuvres → mais aucune mémoire, perdu dans le feed
- **Excel / Numbers** pour leurs ventes → fastidieux, jamais à jour
- **Notes iPhone** pour leur compta → catastrophique au moment des impôts
- **Facebook Events** pour leurs vernissages → audience fragmentée
- **Eventbrite / Weezevent** pour la billetterie → trop cher pour 2 places à 5 €
- **HelloAsso** pour les adhésions → bien mais ne couvre pas tout le reste

---

## D) Concurrents

### 1. Instagram
- ✅ **Bien** : visibilité massive, audience naturelle, format adapté au visuel, gratuit
- ❌ **Mal** : aucune gestion de portfolio structuré, pas de carte des activités, pas de compta, contenus éphémères noyés dans l'algorithme, aucune fonction pro

### 2. Behance / Dribbble
- ✅ **Bien** : portfolio professionnel, bonne mise en valeur des œuvres
- ❌ **Mal** : design-centric (pas pour peintres ni graffeurs), pas de dimension géographique, pas de gestion compta/asso, anglo-saxon

### 3. HelloAsso
- ✅ **Bien** : gestion d'adhésions et billetterie associative en France, gratuit pour l'asso
- ❌ **Mal** : pas de portfolio créateur, pas de carte, pas de réseau social, interface administrative

### 4. Eventbrite / Weezevent
- ✅ **Bien** : billetterie événementielle robuste
- ❌ **Mal** : commissions élevées, sur-dimensionné pour des micro-événements artistiques, aucune dimension communauté

### 5. Tableur Excel + WhatsApp + Google Maps
- ✅ **Bien** : gratuit, contrôle total, déjà connu
- ❌ **Mal** : aucune intégration entre les outils, ressaisie permanente, perte de données, pas social

### Le positionnement AURA
**AURA = Instagram + HelloAsso + Excel + Google Maps, fusionnés et pensés pour la création contemporaine, avec une UX française et soignée.**

---

## E) Liste exhaustive des fonctionnalités

### Auth & profil
| Feature | État | Description |
|---|---|---|
| Inscription email + mot de passe | ✅ | Création de compte avec confirmation email Supabase |
| Connexion classique | ✅ | Email + password |
| Mode démo (3 rôles) | ✅ | Accès instantané sans inscription pour explorer l'app |
| Onboarding multi-étapes | ✅ | Choix Créateur / Explorateur, sélection disciplines, handle Instagram |
| Profil multi-rôles | ✅ | Un même compte peut être Créateur + Explorateur + Collectif simultanément |
| Switcher de contexte | ✅ | Bascule entre les espaces actifs depuis la TopBar |
| Édition profil (avatar, bio, IG) | ✅ | Page Réglages, upload d'avatar via Supabase Storage |
| Suppression de compte RGPD | ✅ | Edge Function qui supprime profil + auth.users + cascade RLS |

### Réseau social
| Feature | État | Description |
|---|---|---|
| Fil d'actualité temps réel | ✅ | Feed des actions récentes (joins, flashs, ventes) via Supabase Realtime |
| Annuaire créateurs / collectifs | ✅ | Liste filtrable selon le rôle actif (créateur voit collectifs et inversement) |
| Modale de profil créateur | ✅ | Mini portfolio (jusqu'à 9 œuvres), bio, lien Instagram |
| Suivre / Ne plus suivre | ✅ | Système de follows persisté en DB |
| Annuaire interne au collectif | ✅ | Vue spécifique pour les Collectifs : leurs créateurs |

### Carte géolocalisée (cœur du produit)
| Feature | État | Description |
|---|---|---|
| Carte mondiale Leaflet + OpenStreetMap | ✅ | Vue par défaut au monde, fly-to position utilisateur |
| Géolocalisation auto au load | ✅ | Demande la position, recentre sur l'utilisateur |
| Bouton "Ma Position" / "Vue Mondiale" | ✅ | Bascule contextuelle |
| Épingler une activité (Créateur/Collectif) | ✅ | Exposition, performance, atelier ouvert, autre |
| Géocodage par adresse (Nominatim) | ✅ | L'utilisateur tape une adresse, lat/lng auto |
| Rencontre Flash | ✅ | Activité éphémère (1h à 12h) marquée en violet vibrant |
| Modale détail activité | ✅ | Sidebar à droite avec détails et créateur |

### Gestion financière (Créateur)
| Feature | État | Description |
|---|---|---|
| Dashboard finances | ✅ | KPIs : CA, dépenses, net, réserve fiscale |
| Ajout dépense | ✅ | Catégorie, montant, description, justificatif (upload) |
| Ajout vente | ✅ | Acheteur (libre ou lié à une œuvre), montant, date |
| Réserve fiscale auto-calculée | ✅ | % paramétrable (défaut 22%), accumulée sur les revenus pro |
| Distinction Pro / Perso | ✅ | Chaque transaction est typée |
| Historique filtrable | ✅ | Tri par date, recherche texte |
| Suppression de transaction | ✅ | Avec confirmation |
| Galerie d'œuvres | ✅ | Cards avec image, statut (en cours / terminé / vendu), prix, dimensions |
| Like d'œuvre | ✅ | Cosmétique, pas persisté |

### Gestion d'association (Collectif)
| Feature | État | Description |
|---|---|---|
| Dashboard collectif | ✅ | KPIs adhérents, cotisations, etc. |
| Liste des adhérents | ✅ | Tableau filtrable, statut, contact, cotisation |
| Ajout / édition adhérent | ✅ | Nom, email, téléphone, statut, montant cotisation |
| Suppression adhérent | ✅ | Avec confirmation |
| Activation par code admin | ✅ | RPC `redeem_admin_code` (atomique, marqué `used`) |
| Comptabilité collective | ✅ | Réutilise le module Finances |

### Événements & ateliers
| Feature | État | Description |
|---|---|---|
| Page Événements | 🚧 | UI prête, contenu hardcodé (pas encore branchée à la DB) |
| Page Ateliers | 🚧 | UI prête, contenu hardcodé (pas encore branchée à la DB) |
| Inscription / réservation | 💡 | Prévu post-lancement |

### Légal & RGPD
| Feature | État | Description |
|---|---|---|
| Mentions légales | ✅ | `/legal/mentions-legales` (à compléter par le founder) |
| CGU | ✅ | `/legal/cgu` |
| Politique de confidentialité | ✅ | `/legal/confidentialite` |
| Bandeau cookies CNIL-compliant | ✅ | Cookies essentiels uniquement, exempté art. 82 LIL |
| Checkbox CGU à l'inscription | ✅ | Bouton désactivé sinon |

### Sécurité (transversal)
| Feature | État | Description |
|---|---|---|
| RLS Supabase sur toutes les tables | ✅ | 12 tables, policies définies (à finaliser pour follows/events/workshops) |
| Headers sécurité Vercel | ✅ | HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| Trigger auto-création profil | ✅ | À chaque nouveau auth.users → profil créé |
| Code admin atomique | ✅ | RPC `redeem_admin_code` évite les race conditions |

---

## F) Parcours utilisateurs critiques

### Parcours 1 — Nouvel artiste qui publie sa première œuvre

1. **Arrivée sur la landing** → voit le formulaire de connexion AURA (logo + tagline "La carte vivante de la création mondiale")
2. **Clique "INSCRIPTION"** → onglet bascule vers le SignUpForm
3. **Remplit** : nom complet, email, mot de passe, **coche obligatoirement** la case CGU (sinon bouton désactivé)
4. **Clique "Créer l'espace"** → reçoit email de confirmation, clique le lien
5. **Atterrit sur l'onboarding** → écran "Bienvenue sur AURA" avec 2 cartes : Créateur (sombre) / Explorateur (blanc)
6. **Clique Créateur** → écran "Votre Trace" : sélectionne 1 à 14 disciplines (chips colorées) + saisit son @instagram
7. **Clique "Laisser ma trace"** → activation du rôle artist en DB, disciplines persistées, redirect vers `/`
8. **Atterrit sur la carte mondiale** → géolocalisation auto, fly-to sa position
9. **Clique "Galerie" dans la sidebar** → page vide avec call-to-action
10. **Clique "Ajouter"** → modale ArtworkForm : titre, technique, dimensions, prix, statut, upload image
11. **Valide** → l'œuvre apparaît dans la galerie, un `feed_event` est créé, visible par tous les autres utilisateurs

### Parcours 2 — Collectif qui inscrit son premier adhérent

1. **Inscription classique** comme un Créateur (étapes 1-4 ci-dessus)
2. **Sur la page d'onboarding**, en bas : lien discret "Je représente un Collectif ? Contactez-nous" (envoie un mail)
3. **Une fois admis**, le founder lui envoie un code d'activation (ex: AURA2026)
4. **Va dans Réglages → Mes Espaces** → toggle "Collectif"
5. **Modale d'activation** : saisit le nom du collectif + le code à 6 caractères
6. **Le code est validé via RPC** (atomique, marqué `used`) → rôle association activé
7. **Bascule sur le contexte Collectif** via le switcher de la TopBar
8. **Atterrit sur le dashboard collectif** (KPIs adhérents)
9. **Clique "Adhérents" dans la sidebar** → tableau vide
10. **Clique "Nouvel Adhérent"** → modale MemberForm
11. **Saisit** : prénom, nom, email, téléphone, statut, montant cotisation
12. **Valide** → adhérent ajouté en DB, ligne dans le tableau, KPIs mis à jour

### Parcours 3 — Visiteur qui découvre une activité sur la carte

1. **Connexion** (ou mode démo)
2. **Atterrit sur la carte** : autorise la géolocalisation
3. **Voit des marqueurs de couleur** autour de lui (rose = expo, turquoise = performance, orange = atelier ouvert, **violet = Rencontre Flash en cours**)
4. **Clique sur un marqueur** → sidebar à droite slide-in : titre, créateur, description, adresse, date
5. **Lit les détails**, clique "Fermer" ou ailleurs sur la carte
6. (Évolution prévue) Pourra cliquer le nom du créateur pour ouvrir son profil

---

## G) Modèle économique

[À COMPLÉTER PAR LE FOUNDER]

**Hypothèse actuelle observée dans le code** :
- Aucun système de paiement intégré (Stripe, Lemon Squeezy, etc.)
- Aucune limite de fonctionnalité par compte
- Le mot "Premium" n'apparaît pas dans le code
- → **Probablement gratuit total au lancement**

**Pistes possibles** :
- Freemium : limite d'œuvres / d'adhérents / d'événements en gratuit, illimité en payant
- Premium pour les Collectifs (CRM avancé, comptabilité multi-utilisateurs, export comptable)
- Commission sur ventes d'œuvres (si paiement intégré un jour)
- Abonnement mensuel symbolique pour les créateurs pros (5-10 €/mois)

---

## H) Stack technique

| Couche | Technologie |
|---|---|
| **Framework front** | React 19.0 + TypeScript 5.8 |
| **Build** | Vite 6.4 |
| **UI lib** | Tailwind CSS 4.1 (pas de design system tiers) |
| **Routing** | React Router v7 (lazy routes) |
| **Animations** | Motion (fork moderne de Framer Motion) v12 |
| **Icônes** | Lucide React 0.546 |
| **Toasts** | Sonner v2 |
| **Carte** | React-Leaflet 5 + Leaflet 1.9 + OpenStreetMap (CartoCDN voyager) |
| **Markdown** | react-markdown 10 (pour pages légales) |
| **Dates** | date-fns 4 (locale fr) |
| **Backend** | Supabase (PostgreSQL 17, Auth, Storage, Realtime, Edge Functions) |
| **Edge Functions** | Deno runtime (delete-account déployée) |
| **Hébergement front** | Vercel (Hobby plan, region auto) |
| **Hébergement DB** | Supabase eu-west-1 (Irlande) |
| **Géocodage** | Nominatim OpenStreetMap (API gratuite) |
| **Analytics** | ❌ Aucun |
| **Monitoring d'erreurs** | ❌ Aucun (Sentry non installé) |
| **Paiement** | ❌ Aucun |
| **Email transactionnel** | Supabase Auth built-in (rate-limited, à remplacer par SMTP custom en prod) |

**URL prod** : `https://aura-ten-pied.vercel.app`
**Repo** : `https://github.com/Mrtropico/aura`

---

## I) Identité visuelle actuelle

### Palette
| Rôle | Nom Tailwind | Hex | Usage |
|---|---|---|---|
| Encre principale | `brand-ink` | `#0F172A` | Texte, boutons CTA principaux |
| Toile de fond | `brand-canvas` | (clair, à confirmer) | Background général |
| Rose / Créateur | `brand-rose` | `#E8507A` | Espace artiste, accent |
| Turquoise / Collectif | `brand-turquoise` | `#0ABAB5` | Espace association, accent |
| Orange / Explorateur | `brand-orange` | `#F97316` | Espace membre, accent |
| Violet | `purple` Tailwind | `#A855F7` | Rencontre Flash uniquement |
| Succès | `emerald` Tailwind | `#10B981` | Validations, montants positifs |
| Erreur | `red` Tailwind | `#EF4444` | Alertes, dépenses |

L'app utilise **3 couleurs identité par rôle** + **1 couleur événementielle** (violet pour les Flashs). C'est cohérent et lisible.

### Typographie
- **Police principale** : (système / Inter par défaut Tailwind — pas de police custom détectée dans le code)
- **Pattern visuel récurrent** : titres en **`font-black uppercase italic tracking-tight`** — ex. `BIENVENUE SUR AURA` avec un effet "branding sportif chic"
- **Sous-titres / labels** : `font-bold uppercase tracking-widest text-[10px]` — micro-typographie très éditoriale

### Logo
- **Pas de logo image** (pas de fichier SVG/PNG dans le repo, juste un `favicon.svg` mentionné dans `index.html` mais le fichier n'existe pas encore)
- Le "logo" actuel est purement typographique : **AURA en `font-black tracking-tight uppercase italic`**, parfois sur fond clair, parfois sur fond sombre

### Tone of voice
- **Très français, soigné, légèrement précieux**
- **Vocabulaire poétique** : "La carte vivante de la création mondiale", "Laisser ma trace", "Votre Trace", "Mes Espaces", "Zone de danger"
- **Pas familier mais pas distant** : tutoie pas, vouvoie peu, parle directement ("Bienvenue sur AURA", "Choisissez au moins une discipline")
- **Mots clés brand** : *trace, espace, vivante, création, collectif*
- **Anti-corporate** : on ne dit jamais "utilisateur", on dit "créateur", "explorateur", "collectif"

---

## J) Métriques actuelles

[À COMPLÉTER PAR LE FOUNDER]

**Ce que je peux constater dans la DB** :
- 1 utilisateur réel à ce jour (`haroldptx2@gmail.com`, le founder lui-même)
- "Total: 10 users (estimated)" affiché dans Supabase mais probablement biais d'estimation pré-cleanup
- 0 œuvre publiée
- 0 adhésion créée
- 0 activité épinglée sur la carte

**À remplir** :
- Combien d'utilisateurs attendus dans les 30 premiers jours ?
- D'où vont venir les premiers : réseau perso ? collectif partenaire ? bouche-à-oreille local ? Instagram ?
- Quel est l'objectif de validation produit (PMF) ? Ex : 100 créateurs actifs ? 10 collectifs payants ? 1000 visites/mois ?

---

## K) Date de lancement et état d'esprit

[À COMPLÉTER PAR LE FOUNDER]

**Ce que je peux observer du contexte** :
- Le founder a déployé en production aujourd'hui (10 mai 2026)
- L'app a été audité et corrigée en 3 phases en quelques heures
- L'urgence est palpable mais le code est propre
- Le founder est seul (pas de mention d'équipe technique)
- Stack maîtrisée mais pas de tests automatisés

**À remplir** :
- Date de lancement officielle visée
- Niveau de stress perçu (1-10)
- Les 3 trucs qui font le plus peur

---

## L) Inspirations

[À COMPLÉTER PAR LE FOUNDER]

**Inspirations apparentes dans le code et l'UI** (à valider par le founder) :
- **Linear** pour la précision des animations et la sobriété sombre/clair
- **Notion** pour l'approche multi-rôles dans un même compte
- **Strava** pour l'idée d'épingler ses activités sur une carte ("Heatmap")
- **Are.na** pour le ton éditorial soigné et la communauté créative
- **Le tone "italique tracking-tight uppercase"** rappelle les magazines indé / fanzines / branding skateboard premium type **Palace Skateboards** ou **Aimé Leon Dore**

---

# 📋 Annexe — Checklist auditeur

L'auditeur peut utiliser cette grille pour structurer sa revue :

### Design & UI
- [ ] La palette est-elle cohérente sur tous les écrans ?
- [ ] La hiérarchie typographique est-elle claire ?
- [ ] Les espacements et rayons des cartes sont-ils harmonieux ?
- [ ] Le mobile rivalise-t-il avec le desktop ?

### UX & parcours
- [ ] L'onboarding est-il assez clair pour un non-tech ?
- [ ] Les 3 rôles sont-ils bien différenciés visuellement ?
- [ ] Le switcher de contexte est-il découvrable ?
- [ ] Y a-t-il des dead-ends (page sans CTA évident) ?

### Naming & ton
- [ ] "AURA" est-il un bon nom (sonorité, mémoire, recherche Google) ?
- [ ] "Créateur / Collectif / Explorateur" est-il évident ou confus ?
- [ ] La tagline "La carte vivante de la création mondiale" est-elle vendable ?

### Stratégie
- [ ] Le pitch en 1 phrase est-il clair ?
- [ ] Le positionnement face à Instagram est-il défendable ?
- [ ] Le modèle éco est-il viable / clair ?
- [ ] Quelle est la défense contre un copycat ?

### Tech (bonus)
- [ ] La perf au load est-elle acceptable (< 2s) ?
- [ ] Le bundle JS est-il raisonnable (< 1 MB) ?
- [ ] Y a-t-il des risques techniques majeurs ?
