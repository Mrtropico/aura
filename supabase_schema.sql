-- Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  is_artist BOOLEAN DEFAULT FALSE,
  is_association BOOLEAN DEFAULT FALSE,
  is_member BOOLEAN DEFAULT FALSE,
  association_name TEXT,
  member_id TEXT,
  instagram_handle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Codes (for association activation)
CREATE TABLE admin_codes (
  code TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert demo admin code
INSERT INTO admin_codes (code) VALUES ('123456');

-- Members
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  association_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'actif',
  membership_fee NUMERIC DEFAULT 7.00,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artworks
CREATE TABLE artworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  price NUMERIC,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finances
CREATE TABLE finances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'income', 'expense'
  amount NUMERIC NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  proof_url TEXT,
  category TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  charges_reserve_rate NUMERIC DEFAULT 0,
  charges_reserve_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows
CREATE TABLE follows (
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  followee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, followee_id)
);

-- Sales
CREATE TABLE sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  buyer_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  buyer_name_free TEXT,
  notes TEXT,
  amount NUMERIC NOT NULL,
  sale_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Map Activities
CREATE TABLE map_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  creator_name TEXT NOT NULL,
  creator_type TEXT NOT NULL, -- 'artist', 'association'
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'exposition', 'performance', 'atelier_ouvert', 'rencontre_flash', 'autre'
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  address TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete own profile." ON profiles FOR DELETE USING (auth.uid() = id);

ALTER TABLE admin_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read admin codes" ON admin_codes FOR SELECT USING (auth.uid() IS NOT NULL);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Association reads own members" ON members FOR SELECT USING (auth.uid() = association_id);
CREATE POLICY "Association inserts members" ON members FOR INSERT WITH CHECK (auth.uid() = association_id);
CREATE POLICY "Association updates members" ON members FOR UPDATE USING (auth.uid() = association_id);
CREATE POLICY "Association deletes members" ON members FOR DELETE USING (auth.uid() = association_id);

ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artworks viewable by all" ON artworks FOR SELECT USING (true);
CREATE POLICY "Users can insert own artworks" ON artworks FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own artworks" ON artworks FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete own artworks" ON artworks FOR DELETE USING (auth.uid() = creator_id);

ALTER TABLE finances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Finances viewable by association" ON finances FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "Finances insertable by association" ON finances FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Finances updatable by association" ON finances FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Finances deletable by association" ON finances FOR DELETE USING (auth.uid() = profile_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows viewable by all" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can insert own follows" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete own follows" ON follows FOR DELETE USING (auth.uid() = follower_id);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sales viewable by seller or buyer" ON sales FOR SELECT USING (auth.uid() = seller_id OR auth.uid() = buyer_id);
CREATE POLICY "Seller can insert sales" ON sales FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Seller can update own sales" ON sales FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Seller can delete own sales" ON sales FOR DELETE USING (auth.uid() = seller_id);

ALTER TABLE map_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Map activities viewable by all" ON map_activities FOR SELECT USING (true);
CREATE POLICY "Users can insert own activities" ON map_activities FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own activities" ON map_activities FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete own activities" ON map_activities FOR DELETE USING (auth.uid() = creator_id);

-- Store all public events for the news feed
CREATE TABLE feed_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  actor_name TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'created_art', 'started_flash', 'joined', etc.
  target_id UUID, -- Optional related entity
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Feed events viewable by all" ON feed_events FOR SELECT USING (true);
CREATE POLICY "Users can insert own feed events" ON feed_events FOR INSERT WITH CHECK (auth.uid() = actor_id);
-- Feed events are immutable, no update or delete except by cascade

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
