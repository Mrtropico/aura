-- TRACE — Migration: ajout colonne discipline dans profiles
-- À exécuter dans Supabase > SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS discipline text DEFAULT NULL;

-- Exemples de valeurs possibles (stockées en JSON array ou texte séparé par virgules) :
-- 'graffiti', 'peinture', 'musique', 'photographie', 'sculpture',
-- 'danse', 'digital', 'tatouage', 'cinema', 'performance',
-- 'ceramique', 'street_art', 'illustration', 'bijouterie'

-- Optionnel : index pour filtrer par discipline sur la carte
CREATE INDEX IF NOT EXISTS idx_profiles_discipline ON profiles(discipline);

-- Corriger les policies RLS trop ouvertes sur members
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members_select_open" ON members;
DROP POLICY IF EXISTS "members_insert_open" ON members;
DROP POLICY IF EXISTS "members_update_open" ON members;
DROP POLICY IF EXISTS "members_delete_open" ON members;

-- Seule l'association propriétaire peut lire/modifier ses adhérents
CREATE POLICY "members_select_by_association" ON members
  FOR SELECT USING (association_id = auth.uid());

CREATE POLICY "members_insert_by_association" ON members
  FOR INSERT WITH CHECK (association_id = auth.uid());

CREATE POLICY "members_update_by_association" ON members
  FOR UPDATE USING (association_id = auth.uid());

CREATE POLICY "members_delete_by_association" ON members
  FOR DELETE USING (association_id = auth.uid());

-- Sécuriser admin_codes : lecture réservée aux authentifiés uniquement
ALTER TABLE admin_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_codes_open" ON admin_codes;

CREATE POLICY "admin_codes_authenticated_only" ON admin_codes
  FOR SELECT USING (auth.role() = 'authenticated');
