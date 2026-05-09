import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type Finance = {
  id: string;
  profile_id: string;
  type: 'income' | 'expense';
  amount: number;
  date: any;
  category: string;
  description: string;
  is_pro: boolean;
  charges_reserve_rate: number;
  charges_reserve_amount: number;
  receipt_url: string;
  created_at: any;
};

export function useFinances() {
  const { user, isDemo } = useAuth();
  const [items, setItems] = useState<Finance[]>([]);
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
          id: 'f1',
          profile_id: 'demo-user-id',
          type: 'income',
          amount: 1500,
          date: '2023-10-01T00:00:00Z',
          category: 'Vente',
          description: 'Vente oeuvre "Abstraction Bleue"',
          is_pro: true,
          charges_reserve_rate: 0,
          charges_reserve_amount: 0,
          receipt_url: '',
          created_at: new Date().toISOString(),
        },
        {
          id: 'f2',
          profile_id: 'demo-user-id',
          type: 'expense',
          amount: 120.50,
          date: '2023-10-05T00:00:00Z',
          category: 'Matériel',
          description: 'Achat pinceaux et toiles',
          is_pro: true,
          charges_reserve_rate: 22,
          charges_reserve_amount: 26.51,
          receipt_url: '',
          created_at: new Date().toISOString(),
        }
      ]);
      setLoading(false);
      return;
    }

    const fetchFinances = async () => {
      const { data, error } = await supabase
        .from('finances')
        .select('*')
        .eq('profile_id', user.id) // note: db schema above was association_id - should be profile_id for both artists and association
        .order('date', { ascending: false });

      if (!error && data) {
        setItems(data as Finance[]);
      }
      setLoading(false);
    };

    fetchFinances();

    const subscription = supabase
      .channel(`finances_changes_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'finances' }, () => {
        fetchFinances();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  async function create(payload: Omit<Finance, 'id' | 'created_at' | 'profile_id' | 'charges_reserve_amount'>) {
    if (!user) return { error: 'Not authed' };
    
    // Calculate reserve amount if pro income
    const charges_reserve_amount = (payload.type === 'income' && payload.is_pro) 
      ? Math.round(payload.amount * (payload.charges_reserve_rate || 0)) / 100 
      : 0;

    try {
      const { error } = await supabase.from('finances').insert([{
        ...payload,
        profile_id: user.id,
        charges_reserve_amount,
      }]);
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Failed to create finance record' };
    }
  }

  async function remove(id: string) {
    try {
      const { error } = await supabase.from('finances').delete().eq('id', id);
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Failed to delete finance record' };
    }
  }

  return { items, loading, create, remove };
}
