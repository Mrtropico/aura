# CODE INVENTORY — L'Atelier / AURA v5
*Audit technique exhaustif — basé sur lecture directe du code source*

---

## A) Architecture des pages

| Path | Composant | Fichier | Auth | Rôle | Statut |
|------|-----------|---------|------|------|--------|
| `/login` | `LoginPage` | `src/pages/LoginPage.tsx` | Non | — | ✅ Fonctionnel |
| `/legal/:slug` | `LegalPage` | `src/pages/LegalPage.tsx` | Non | — | ✅ Fonctionnel |
| `/onboarding` | `OnboardingPage` | `src/pages/OnboardingPage.tsx` | Oui | Aucun (pré-rôle) | ✅ Fonctionnel |
| `/` | `MapPage` | `src/pages/MapPage.tsx` | Oui | Aucun | 🚧 Fonctionnel avec bug geocoding |
| `/settings` | `SettingsPage` | `src/pages/SettingsPage.tsx` | Oui | Aucun | ✅ Fonctionnel |
| `/network` | `NetworkPage` | `src/pages/NetworkPage.tsx` | Oui | Aucun | ✅ Fonctionnel |
| `/ateliers` | `WorkshopsPage` | `src/pages/WorkshopsPage.tsx` | Oui | Aucun | ❌ Stub total (3 cartes hardcodées) |
| `/events` | `EventsPage` | `src/pages/EventsPage.tsx` | Oui | Aucun | ❌ Stub total (2 événements hardcodés) |
| `/dashboard` | `DashboardPage → ArtistDashboard` | `src/pages/DashboardPage.tsx` | Oui | `artist` | ✅ Fonctionnel |
| `/gallery` | `GalleryPage` | `src/pages/GalleryPage.tsx` | Oui | `artist` | ✅ Fonctionnel |
| `/finances` | `FinancesPage` | `src/pages/FinancesPage.tsx` | Oui | `artist` | 🚧 Fonctionnel (bug démo réserve) |
| `/home` | `MemberHomePage` | `src/pages/MemberHomePage.tsx` | Oui | `member` | 🚧 Partiel |
| `/profile` | `SettingsPage` (alias) | `src/pages/SettingsPage.tsx` | Oui | `member` | ✅ Fonctionnel |
| `/admin` | `DashboardPage → AssoDashboard` | `src/pages/DashboardPage.tsx` | Oui | `association` | 🚧 Partiel |
| `/members` | `MembersPage` | `src/pages/MembersPage.tsx` | Oui | `association` | ✅ Fonctionnel |
| `/accounting` | `FinancesPage` (alias) | `src/pages/FinancesPage.tsx` | Oui | `association` | ✅ Fonctionnel |
| `/artists` | `ArtistDirectoryPage` | `src/pages/ArtistDirectoryPage.tsx` | Oui | `association` | 🚧 Partiel |
| `*` | Redirect `/` | `src/App.tsx` | — | — | ✅ |

**Remarque importante :** La route `/` est la **MapPage**, pas un hub ou un feed. Un nouvel utilisateur atterrit donc sur une carte mondiale vide (zoom 2, centre [20,0]) sans aucune épingle si la DB est vide. C'est le premier point de friction.

---

## B) Composants partagés

| Composant | Fichier | Utilisé dans |
|-----------|---------|--------------|
| `Shell` | `src/components/layout/Shell.tsx` | `App.tsx` (layout racine de toutes les routes protégées) |
| `Sidebar` | `src/components/layout/Sidebar.tsx` | `Shell.tsx` |
| `TopBar` | `src/components/layout/TopBar.tsx` | `Shell.tsx` — contient le **RoleSwitcher** intégré |
| `BottomBar` | `src/components/layout/BottomBar.tsx` | `Shell.tsx` (navigation mobile) |
| `ErrorBoundary` | `src/components/layout/ErrorBoundary.tsx` | `App.tsx` (wrapping de chaque route) |
| `CookieBanner` | `src/components/layout/CookieBanner.tsx` | `App.tsx` |
| `Modal` | `src/components/ui/Modal.tsx` | `FinancesPage`, `GalleryPage`, `MembersPage` |
| `ConfirmModal` | `src/components/ui/ConfirmModal.tsx` | `FinancesPage`, `GalleryPage`, `MembersPage` |
| `StatPill` | `src/components/ui/StatPill.tsx` | `ArtistDashboard`, `AssoDashboard`, `FinancesPage` |
| `ArtworkForm` | `src/components/artist/ArtworkForm.tsx` | `GalleryPage` |
| `ExpenseForm` | `src/components/artist/ExpenseForm.tsx` | `FinancesPage` |
| `SaleForm` | `src/components/artist/SaleForm.tsx` | `FinancesPage` |
| `ArtistDashboard` | `src/components/artist/ArtistDashboard.tsx` | `DashboardPage` |
| `MemberForm` | `src/components/association/MemberForm.tsx` | `MembersPage` |
| `AssoDashboard` | `src/components/association/AssoDashboard.tsx` | `DashboardPage` |

---

## C) Logique métier critique

### C1 — Calcul de la réserve fiscale

**Fichier :** `src/hooks/useFinances.ts`, lignes 94–100

```typescript
async function create(payload) {
  // La logique de production est CORRECTE :
  // réserve uniquement sur les revenus professionnels
  const charges_reserve_amount = (payload.type === 'income' && payload.is_pro)
    ? Math.round(payload.amount * (payload.charges_reserve_rate || 0)) / 100
    : 0;
}
```

**⚠️ BUG DANS LA DÉMO HARDCODÉE** (lignes 56–60) :
```typescript
// useFinances.ts — démo data
{
  id: 'f2',
  type: 'expense',            // ← c'est une DÉPENSE
  amount: 120.50,
  charges_reserve_rate: 22,
  charges_reserve_amount: 26.51,  // ← réserve calculée sur une dépense = FAUX
}
```
En mode démo, `totalReserve` inclut 26.51€ provenant d'une dépense. Le "Net estimé" affiché dans `ArtistDashboard` est faux de ~26€. Le taux de 22% devrait être appliqué au revenu de 1500€ → réserve réelle = 330€, pas 26.51€.

**Fix :** Mettre `charges_reserve_rate: 0` et `charges_reserve_amount: 0` sur la ligne demo `expense`. Créer une ligne income avec `charges_reserve_rate: 22` pour démontrer correctement la feature.

---

### C2 — Logique feed_events

La table `feed_events` est alimentée **manuellement côté client**, sans triggers DB. Un seul endroit génère des events :

```typescript
// src/pages/MapPage.tsx — ligne 187-192
// Déclenché SEULEMENT lors d'un "Rencontre Flash"
await supabase.from('feed_events').insert([{
  actor_id: user.id,
  actor_name: profile.full_name,
  action_type: 'started_flash',
  metadata: { title: flashForm.what, address: flashForm.where }
}]);
```

**Ce qui n'alimente PAS le feed (actions silencieuses) :**
- Ajout d'une œuvre → `ArtworkForm.tsx` — aucun insert dans `feed_events`
- Nouvelle épingle normale → `handleAddActivity` — aucun insert
- Première inscription → `OnboardingPage` — aucun insert
- Vente d'une œuvre → `SaleForm.tsx` — aucun insert

**Conséquence :** Le fil d'actualité de `NetworkPage` est vide en dehors des Flashs.

---

### C3 — Géocodage Nominatim

```typescript
// src/pages/MapPage.tsx — lignes 107-128
const handleGeocode = async (addressStr: string, isFlash = false) => {
  if (!addressStr) return;
  setGeocoding(true);
  try {
    const response = await fetch(
      // ❌ Pas de header Accept-Language: fr
      // ❌ Pas de paramètre countrycodes=fr pour limiter à la France
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressStr)}`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      setForm(f => ({ ...f, lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }));
    } else {
      toast.error("Adresse introuvable");
    }
  } catch (err) {
    console.error(err); // ← console.error en prod
    toast.error("Erreur de géolocalisation");
  }
};
// Appelé sur onBlur du champ adresse — SANS debounce
```

**Bugs identifiés :**
1. **Pas de debounce** : se déclenche dès qu'on quitte le champ, même sur une adresse incomplète
2. **Pas de `Accept-Language: fr`** : résultats possiblement en anglais
3. **Pas de `countrycodes=fr`** : "Place du Capitole" pourrait renvoyer un résultat à Washington DC
4. **Géolocalisation silencieuse** : `navigator.geolocation.getCurrentPosition(..., () => {}, ...)` — l'erreur callback est vide (ligne 138), échec silencieux sur mobile

---

### C4 — Hooks Supabase Realtime

```typescript
// useFinances.ts (lignes 83-88) — re-fetch complet
supabase.channel(`finances_changes_${user.id}`)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'finances' }, () => {
    fetchFinances(); // Recharge toute la liste
  }).subscribe();

// MapPage.tsx (lignes 154-159) — re-fetch complet
supabase.channel('public:map_activities')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'map_activities' }, () => {
    fetchActivities();
  }).subscribe();

// NetworkPage.tsx (lignes 205-208) — append optimiste
supabase.channel('feed')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feed_events' }, (payload) => {
    setEvents(current => [payload.new as FeedEvent, ...current].slice(0, 50));
  }).subscribe();
```

**Note :** Aucun des trois canaux ne gère la reconnexion après perte réseau. Le channel `finances_changes_${user.id}` utilise l'uid dans le nom — correct pour éviter les collisions entre sessions.

---

### C5 — SwitcherContext (changement de rôle)

```typescript
// src/contexts/AuthContext.tsx — lignes 50-60
const switchContext = (context: RoleType) => {
  localStorage.setItem('aura_active_context', context); // clé: 'aura_active_context'
  setActiveRoleState(context);
};

// Priorité automatique à la connexion :
const getPriorityContext = (p: Profile): RoleType | null => {
  if (p.is_association) return 'association'; // highest priority
  if (p.is_artist) return 'artist';
  if (p.is_member) return 'member';
  return null;
};
```

Le switcher visuel est dans `src/components/layout/TopBar.tsx` (composant `SwitcherItem`). Il est fonctionnel pour les utilisateurs multi-rôles. **Limite :** Sur mobile, il n'est pas accessible via la `BottomBar`.

---

## D) Pages hardcodées ou stub — liste exhaustive

| Fichier | Lignes | Données fausses |
|---------|--------|-----------------|
| `src/pages/EventsPage.tsx` | 30–84 | `[1, 2].map(i => ...)` — "Marché de Créateurs de Printemps 1/2", date **22 Mai 2026**, prix **2.00€**, horaires **10h-19h** — tout fictif |
| `src/pages/WorkshopsPage.tsx` | 30–77 | `[1, 2, 3].map(i => ...)` — "Atelier Sculpture 1/2/3", prix **15€/7€**, capacité **12** — tout fictif |
| `src/hooks/useFinances.ts` | 33–65 | Mode démo : income 1500€ + expense 120.50€ avec bug réserve (cf. C1) |
| `src/pages/EventsPage.tsx` | 22–24 | Bouton "Créer un événement" — `setLoading` jamais utilisé, aucun handler réel |
| `src/pages/WorkshopsPage.tsx` | 22–24 | Bouton "Nouvel Atelier" — idem, aucun handler |
| `src/pages/GalleryPage.tsx` | 12 | `handleLike(e: any)` — like non persisté, aucune table `likes` en DB |

---

## E) Matrice lecture/écriture Supabase

| Table | Lu par | Écrit par |
|-------|--------|-----------|
| `profiles` | `AuthContext`, `NetworkPage`, `SettingsPage`, `OnboardingPage` | `AuthContext` (signUp, activateRole, updateProfile) |
| `artworks` | `useArtworks`, `NetworkPage` (modal artiste), `ArtistDashboard` | `ArtworkForm` via `useArtworks.create()` |
| `finances` | `useFinances`, `FinancesPage`, `ArtistDashboard` | `ExpenseForm` via `useFinances.create()` |
| `sales` | `useSales`, `FinancesPage`, `ArtistDashboard` | `SaleForm` via `useSales.create()` |
| `members` | `useMembers`, `MembersPage` | `MemberForm` via `useMembers.create/update()` |
| `map_activities` | `MapPage` | `MapPage` (handleAddActivity + handleAddFlash) |
| `feed_events` | `NetworkPage` (realtime subscribe) | `MapPage` (seulement Flash) |
| `follows` | `NetworkPage` | `NetworkPage` (handleToggleFollow) |
| `admin_codes` | `OnboardingPage` (validation) | Jamais depuis le front — insertion SQL manuelle uniquement |
| `storage/images` | `ArtworkForm`, `SettingsPage` | `src/lib/storage.ts` → `uploadImage()` |

**Incohérence schéma vs code :**
- `artworks` en DB : colonne `creator_id` (supabase_schema.sql l.44) — mais `useArtworks.ts` filtre par `profile_id` → risque de 0 résultats si la migration n'a pas aligné les noms
- `finances` en DB : colonne `proof_url` (l.63) — mais le type TypeScript dans `useFinances.ts` déclare `receipt_url` → les justificatifs ne se chargent jamais

---

## F) Dette technique

### console.log/error oubliés (présents en production)
| Fichier | Ligne | Contenu |
|---------|-------|---------|
| `src/lib/storage.ts` | 15 | `console.error('Storage error:', error)` |
| `src/contexts/AuthContext.tsx` | 92 | `console.error("Error fetching profile:", error)` |
| `src/pages/MapPage.tsx` | 123 | `console.error(err)` dans handleGeocode |
| `src/components/artist/ArtworkForm.tsx` | 78 | `console.error(err)` |
| `src/hooks/useArtworks.ts` | 132 | `console.error(err)` |
| `src/hooks/useFollows.ts` | 85 | `console.error(err)` |
| `src/pages/SettingsPage.tsx` | 64, 86, 129, 157 | 4× `console.error` |

### Typages `any` à corriger (priorité haute)
- `src/contexts/AuthContext.tsx` : `created_at?: any`, `updated_at?: any`, `const updates: any = {}`
- `src/hooks/useFinances.ts` : `date: any`, `created_at: any`
- `src/pages/MapPage.tsx` : `start_date: any`, `end_date?: any`
- `src/pages/NetworkPage.tsx` : `metadata: any`, `useState<any[]>([])`
- `src/components/layout/TopBar.tsx` : `function SwitcherItem({ ... }: any)`

### Failles de sécurité
1. **`supabase_schema.sql` ligne 25** : `INSERT INTO admin_codes (code) VALUES ('123456')` — code admin en clair dans le fichier de migration, déployé en production si le script est rejoué
2. **`supabase_schema.sql` ligne 119** : `CREATE POLICY "Authenticated can read admin codes" ... FOR SELECT USING (auth.uid() IS NOT NULL)` — **tout utilisateur connecté peut lire la liste complète des codes admin**, y compris ceux non utilisés. Il suffit d'un `SELECT * FROM admin_codes` en console Supabase avec un compte lambda.

### Code mort confirmé
- `src/pages/GalleryPage.tsx` : `handleLike` — fonction déclarée, jamais appelée depuis un bouton visible, aucune table `likes`
- `src/pages/EventsPage.tsx` : `const [loading, setLoading] = useState(false)` — `loading` jamais passé à `true`
- `src/pages/WorkshopsPage.tsx` : idem, `loading` state inutilisé
