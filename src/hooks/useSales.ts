import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type Sale = {
  id: string;
  profile_id: string;
  buyer_name_free: string;
  amount: number;
  sale_date: any;
  notes: string;
  created_at: any;
};

export function useSales() {
  const { user, isDemo } = useAuth();
  const [items, setItems] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    if (isDemo) {
      setItems([
        {
          id: 's1',
          profile_id: 'demo-user-id',
          buyer_name_free: 'Galerie Vivienne',
          amount: 1500,
          sale_date: '2023-10-01T00:00:00Z',
          notes: 'Payé par virement — Œuvre : Abstraction Bleue',
          created_at: new Date().toISOString(),
        }
      ]);
      setLoading(false);
      return;
    }

    const fetchSales = async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('profile_id', user.id)
        .order('sale_date', { ascending: false });

      if (!error && data) {
        setItems(data as Sale[]);
      }
      setLoading(false);
    };

    fetchSales();

    const subscription = supabase
      .channel(`sales_changes_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
        fetchSales();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  async function create(payload: Omit<Sale, 'id' | 'created_at' | 'profile_id'>) {
    if (!user) return { error: 'Not authed' };
    try {
      const { error } = await supabase.from('sales').insert([{
        ...payload,
        profile_id: user.id
      }]);
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Failed to record sale' };
    }
  }

  return { items, loading, create };
}
