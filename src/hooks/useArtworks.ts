import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type Artwork = {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  medium: string;
  dimensions: string;
  status: 'en_cours' | 'termine' | 'vendu';
  price: number | null;
  image_url: string;
  tags: string[];
  buyer_member_id: string | null;
  created_at: any;
};

const ITEMS_PER_PAGE = 12;

export function useArtworks() {
  const { user, isDemo } = useAuth();
  const [items, setItems] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    if (isDemo) {
      setItems([
        {
          id: 'demo-1',
          profile_id: 'demo-user-id',
          title: 'Abstraction Bleue',
          description: 'Une étude sur le mouvement et la couleur.',
          medium: 'Huile sur toile',
          dimensions: '100x100cm',
          status: 'en_cours',
          price: 1200,
          image_url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19',
          tags: ['abstrait', 'bleu'],
          buyer_member_id: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 'demo-2',
          profile_id: 'demo-user-id',
          title: 'Regard Ephémère',
          description: 'Portrait réaliste à la mine de plomb.',
          medium: 'Fusain',
          dimensions: '50x70cm',
          status: 'termine',
          price: 450,
          image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
          tags: ['portrait', 'fusain'],
          buyer_member_id: null,
          created_at: new Date().toISOString(),
        }
      ]);
      setLoading(false);
      setHasMore(false);
      return;
    }

    let isMounted = true;
    
    const fetchFirstPage = async () => {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .range(0, ITEMS_PER_PAGE - 1);

      if (isMounted) {
        if (!error && data) {
          setItems(data as Artwork[]);
          setHasMore(data.length === ITEMS_PER_PAGE);
        }
        setPage(0);
        setLoading(false);
      }
    };

    fetchFirstPage();

    const subscription = supabase
      .channel(`artworks_changes_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'artworks' }, () => {
        fetchFirstPage();
      })
      .subscribe();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [user, isDemo]);

  const loadMore = async () => {
    if (!user || isDemo || loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    const from = nextPage * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (!error && data) {
        setItems(prev => [...prev, ...data as Artwork[]]);
        setHasMore(data.length === ITEMS_PER_PAGE);
        setPage(nextPage);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  async function create(payload: Omit<Artwork, 'id' | 'created_at' | 'profile_id'>) {
    if (!user) return { error: 'Not authed' };
    try {
      const { error } = await supabase.from('artworks').insert([{
        ...payload,
        profile_id: user.id
      }]);
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Failed to create artwork' };
    }
  }

  async function update(id: string, payload: Partial<Artwork>) {
    try {
      const { error } = await supabase.from('artworks').update(payload).eq('id', id);
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Failed to update artwork' };
    }
  }

  async function remove(id: string) {
    try {
      const { error } = await supabase.from('artworks').delete().eq('id', id);
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Failed to delete artwork' };
    }
  }

  return { items, loading, create, update, remove, loadMore, hasMore, loadingMore };
}
