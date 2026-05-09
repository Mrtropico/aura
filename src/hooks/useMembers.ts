import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export type Member = {
  id: string;
  association_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  membership_fee: number;
  joined_at: any;
  created_at: any;
};

export function useMembers() {
  const { user, isDemo } = useAuth();
  const [items, setItems] = useState<Member[]>([]);
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
          id: 'm1',
          association_id: 'demo-user-id',
          first_name: 'Jean',
          last_name: 'Dupont',
          email: 'jean@example.com',
          phone: '06 12 34 56 78',
          status: 'actif',
          membership_fee: 15,
          joined_at: '2023-01-15T00:00:00Z',
          created_at: new Date().toISOString(),
        },
        {
          id: 'm2',
          association_id: 'demo-user-id',
          first_name: 'Marie',
          last_name: 'Curie',
          email: 'marie@example.com',
          phone: '07 88 99 00 11',
          status: 'actif',
          membership_fee: 15,
          joined_at: '2023-03-22T00:00:00Z',
          created_at: new Date().toISOString(),
        }
      ]);
      setLoading(false);
      return;
    }

    const fetchMembers = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('association_id', user.id)
        .order('last_name', { ascending: true });
        
      if (!error && data) {
        setItems(data as Member[]);
      }
      setLoading(false);
    };

    fetchMembers();

    const subscription = supabase
      .channel(`members_changes_${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        fetchMembers();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  async function create(payload: Omit<Member, 'id' | 'created_at' | 'association_id'>) {
    if (!user) return { error: 'Not authed' };
    try {
      const { error } = await supabase.from('members').insert([{
        association_id: user.id,
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone: payload.phone || null,
        status: payload.status,
        membership_fee: payload.membership_fee,
        joined_at: payload.joined_at
      }]);
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Failed to create member' };
    }
  }

  async function update(id: string, payload: Partial<Member>) {
    try {
      const updateData: any = {};
      if (payload.first_name !== undefined) updateData.first_name = payload.first_name;
      if (payload.last_name !== undefined) updateData.last_name = payload.last_name;
      if (payload.email !== undefined) updateData.email = payload.email;
      if (payload.phone !== undefined) updateData.phone = payload.phone;
      if (payload.status) updateData.status = payload.status;
      if (payload.membership_fee !== undefined) updateData.membership_fee = payload.membership_fee;
      if (payload.joined_at) updateData.joined_at = payload.joined_at;

      const { error } = await supabase.from('members').update(updateData).eq('id', id);
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Failed to update member' };
    }
  }

  async function remove(id: string) {
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      return { error: error?.message || null };
    } catch (error: any) {
      return { error: error.message || 'Failed to delete member' };
    }
  }

  return { items, loading, create, update, remove };
}
