# Dossier d'audit — AURA

Ce dossier contient tout le matériel nécessaire à un auditeur externe (designer, ingénieur senior, marketeur) pour produire une revue complète du produit **AURA**, sans avoir à lancer l'application lui-même.

---

## 📚 Ordre de lecture recommandé

### 1. Brief produit complet (★★★)
**`audit/BRIEF.md`** — Document principal de 12 sections :
- A) Pitch en 1 phrase
- B) Promesse principale
- C) Public cible (3 personas)
- D) Concurrents
- E) Liste exhaustive des fonctionnalités (par module)
- F) Parcours utilisateurs critiques
- G) Modèle économique [À COMPLÉTER]
- H) Stack technique
- I) Identité visuelle
- J) Métriques [À COMPLÉTER]
- K) État d'esprit founder [À COMPLÉTER]
- L) Inspirations [À COMPLÉTER]

### 2. Captures visuelles (★★★)
**`audit/screenshots/`** — 26 captures PNG, viewport desktop 1440×900 et mobile 390×844.

### 3. Script de capture (référence)
**`audit/capture-screenshots.mjs`** — Le script Playwright utilisé pour générer les screenshots. Réutilisable si l'app évolue : `node audit/capture-screenshots.mjs` (avec dev server lancé sur :3000).

---

## 🖼️ Index des screenshots

### Onboarding & Auth
| Fichier | Description |
|---|---|
| `01-landing-deconnecte.png` | Page d'accueil (login) — vue déconnectée + bandeau cookies + footer légal |
| `02-signup.png` | Formulaire d'inscription avec checkbox CGU obligatoire |
| `03-login.png` | Formulaire de connexion + accès démo 3 rôles |
| `04-onboarding-step1.png` | Premier écran d'onboarding (proxy : formulaire d'inscription, le vrai onboarding nécessite un compte non confirmé) |
| `26-cookie-banner.png` | Bandeau cookies CNIL-compliant (bouton "OK, j'ai compris" + lien vers confidentialité) |

### Espace Créateur
| Fichier | Description |
|---|---|
| `07-home-connecte.png` | Home connecté = la carte mondiale |
| `15-map.png` | Carte Leaflet (les tuiles n'ont pas eu le temps de charger lors de la capture, mais on voit le layout : sidebar + carte + bouton "Vue Mondiale") |
| `16-map-add-activity.png` | Modale d'ajout d'activité (épingler) |
| `13-artworks-liste.png` | Galerie d'œuvres |
| `14-artworks-add.png` | Formulaire d'ajout d'œuvre |
| `17-finances-dashboard.png` | Dashboard finances avec KPIs + réserve fiscale auto-calculée + historique |
| `18-finances-add.png` | Modale d'ajout de revenu |
| `19-sales-liste.png` | Historique des ventes (visible dans le dashboard finances) |

### Réseau social
| Fichier | Description |
|---|---|
| `08-feed.png` | Fil d'actualité temps réel |
| `09-network-liste.png` | Liste de l'annuaire (créateurs / collectifs) |

### Espace Collectif
| Fichier | Description |
|---|---|
| `20-collectif-dashboard.png` | Dashboard d'un compte associatif |
| `21-members-liste.png` | Liste des adhérents en tableau |
| `22-members-add.png` | Modale d'ajout d'adhérent |

### Pages mockup (à brancher)
| Fichier | Description |
|---|---|
| `23-events-liste.png` | Page événements (UI prête, données hardcodées) |
| `24-workshops-liste.png` | Page ateliers (UI prête, données hardcodées) |

### Profil & paramètres
| Fichier | Description |
|---|---|
| `11-profil-perso.png` | Vue Réglages avec carte d'identité utilisateur |
| `12-profil-edit.png` | Édition du profil (formulaire visible) |
| `25-settings.png` | Page Réglages complète (rôles, zone de danger, footer légal) |

### Mobile (375px)
| Fichier | Description |
|---|---|
| `27-mobile-home.png` | Vue mobile de la home (carte) |
| `28-mobile-network.png` | Vue mobile du réseau |
| `29-mobile-map.png` | Vue mobile de la carte |

---

## ⚠️ Notes importantes pour l'auditeur

1. **Mode démo activé** dans la majorité des captures — les noms d'utilisateur ("Invité Démo"), œuvres, finances et adhérents sont des données fictives injectées par le mode démo, pas de la vraie data utilisateur.

2. **Carte Leaflet vide** sur certains screenshots — c'est juste un timing de chargement des tuiles OpenStreetMap. En usage réel, la carte se peuple instantanément avec les marqueurs.

3. **Onboarding réel non capturé** — l'onboarding ne se déclenche que pour un compte sans rôle activé. En mode démo, les rôles sont déjà actifs. Pour voir l'onboarding réel : créer un compte sur l'environnement de prod ou désactiver la confirmation email puis créer un compte vierge.

4. **Pages Événements et Ateliers en mockup** — l'UI existe mais les données sont hardcodées. À brancher post-lancement.

5. **L'app est en français** — pas de version anglaise prévue dans cette V1.

---

## 🔗 Liens utiles

- **Production** : https://aura-ten-pied.vercel.app
- **Repo GitHub** : https://github.com/Mrtropico/aura
- **Supabase** : projet `rsxgvutnpfkebjnutjyl` (région eu-west-1)

---

## 📝 Checklist auditeur (rappel)

L'auditeur trouvera une grille de revue structurée en fin de `BRIEF.md` (section *Annexe — Checklist auditeur*), couvrant :
- Design & UI
- UX & parcours
- Naming & ton
- Stratégie produit
- Tech (bonus)
