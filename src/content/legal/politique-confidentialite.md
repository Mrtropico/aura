# Politique de confidentialité

_Dernière mise à jour : 10 mai 2026_

## 1. Responsable du traitement

Le responsable du traitement des données personnelles collectées sur AURA est **VSL — Vivre Sa Liberté**, joignable à l'adresse **contact@aura.art**.

## 2. Données collectées

AURA collecte uniquement les données nécessaires à son fonctionnement :

| Catégorie | Données | Base légale |
|---|---|---|
| Compte utilisateur | Email, mot de passe (chiffré), nom complet | Exécution du contrat |
| Profil public | Avatar, biographie, disciplines, handle Instagram, nom du collectif | Exécution du contrat |
| Géolocalisation | Position approximative (au moment où vous épinglez une activité sur la carte) | Consentement explicite |
| Activité | Œuvres, événements épinglés, abonnements, ventes | Exécution du contrat |
| Données techniques | Logs de connexion, adresse IP (via Supabase) | Intérêt légitime (sécurité) |

## 3. Finalités

Les données sont utilisées pour :

- Permettre la création et la gestion de votre compte
- Afficher votre profil et vos contributions aux autres utilisateurs
- Permettre les interactions sociales (abonnements, fil d'actualité)
- Assurer la sécurité du service et prévenir les abus

**AURA n'utilise jamais vos données à des fins publicitaires et ne les vend à aucun tiers.**

## 4. Durée de conservation

- Données du compte : conservées tant que votre compte est actif
- En cas de suppression du compte : effacement immédiat et irréversible de toutes vos données dans un délai maximum de 30 jours
- Logs techniques : 12 mois maximum

## 5. Sous-traitants

AURA s'appuie sur les sous-traitants suivants, choisis pour leur conformité RGPD :

- **Vercel Inc.** (hébergement frontend) — données traitées aux USA, sous Standard Contractual Clauses
- **Supabase Inc.** (base de données, authentification, stockage) — région Europe (eu-west-1, Irlande)
- **OpenStreetMap / CartoDB** (fonds de carte) — aucune donnée personnelle transmise

## 6. Vos droits

Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :

- **Droit d'accès** : consulter les données vous concernant
- **Droit de rectification** : corriger vos données depuis votre page Réglages
- **Droit à l'effacement** : supprimer votre compte depuis la zone de danger des Réglages
- **Droit à la portabilité** : recevoir vos données dans un format structuré
- **Droit d'opposition** et **droit à la limitation** du traitement

Pour exercer ces droits : **contact@aura.art**. Vous pouvez également déposer une réclamation auprès de la **CNIL** (www.cnil.fr).

## 7. Cookies

AURA utilise uniquement des **cookies strictement nécessaires** au fonctionnement du service :

- Cookie de session (authentification Supabase)
- LocalStorage technique (préférence d'espace actif, choix de consentement cookies)

Aucun cookie publicitaire, aucun traceur tiers, aucun outil d'analyse comportementale n'est utilisé. Ces cookies sont exemptés de consentement préalable au sens de l'article 82 de la loi Informatique et Libertés.

## 8. Sécurité

Vos données sont protégées par :

- Chiffrement HTTPS de bout en bout (TLS 1.3)
- Mots de passe stockés sous forme de hash bcrypt
- Row Level Security (RLS) au niveau base de données
- Headers de sécurité stricts (HSTS, CSP, X-Frame-Options)
