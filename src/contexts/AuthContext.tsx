import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  is_artist: boolean;
  is_member: boolean;
  is_association: boolean;
  association_name?: string;
  member_id?: string;
  instagram_handle?: string;
  discipline?: string;
  created_at?: any;
  updated_at?: any;
};

type RoleType = 'artist' | 'association' | 'member';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  activeRole: RoleType | null; // This represents the active context
  loading: boolean;
  isDemo?: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  enterDemoMode: (type: RoleType) => void;
  switchContext: (context: RoleType) => void;
  activateRole: (role: RoleType, data?: any) => Promise<{ error: string | null }>;
  deactivateRole: (role: RoleType) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeRole, setActiveRoleState] = useState<RoleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const switchContext = (context: RoleType) => {
    localStorage.setItem('aura_active_context', context);
    setActiveRoleState(context);
  };

  const getPriorityContext = (p: Profile): RoleType | null => {
    if (p.is_association) return 'association';
    if (p.is_artist) return 'artist';
    if (p.is_member) return 'member';
    return null;
  };

  async function fetchProfile(uid: string) {
    if (isDemo) return;
    try {
      const { data: docSnap, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (docSnap) {
        setProfile(docSnap as Profile);
        
        // Handle active context
        const savedCtx = localStorage.getItem('aura_active_context') as RoleType;
        const isValid = savedCtx && (
          (savedCtx === 'artist' && docSnap.is_artist) ||
          (savedCtx === 'member' && docSnap.is_member) ||
          (savedCtx === 'association' && docSnap.is_association)
        );

        if (isValid) {
          setActiveRoleState(savedCtx);
        } else {
          const priority = getPriorityContext(docSnap as Profile);
          if (priority) switchContext(priority);
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (sessionStorage.getItem('demo_mode')) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false));
      } else {
        setProfile(null);
        setActiveRoleState(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (sessionStorage.getItem('demo_mode')) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setActiveRoleState(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isDemo]);

  // Load demo state
  useEffect(() => {
    const demoType = sessionStorage.getItem('demo_mode') as RoleType;
    if (demoType) {
      setIsDemo(true);
      const name = "Invité Démo";
      setUser({ id: 'demo-user-id', email: 'demo@aura.art' } as any);
      const demoProfile: Profile = {
        id: 'demo-user-id',
        email: 'demo@aura.art',
        full_name: name,
        avatar_url: '',
        bio: 'Compte de démonstration.',
        is_artist: demoType === 'artist',
        is_member: demoType === 'member',
        is_association: demoType === 'association',
        association_name: demoType === 'association' ? 'Collectif Démo' : '',
        member_id: '',
        instagram_handle: '',
        created_at: new Date()
      };
      setProfile(demoProfile);
      setActiveRoleState(demoType);
      setLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    activeRole,
    loading,
    isDemo,
    async signIn(email, password) {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message || null };
      } catch (error: any) {
        return { error: error.message };
      }
    },
    async signUp(email, password, fullName) {
      try {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
        });

        if (error) return { error: error.message };
        
        if (data.user) {
          // Create profile
          const profileData = {
            id: data.user.id,
            email,
            full_name: fullName,
            is_artist: false,
            is_member: false,
            is_association: false,
            bio: '',
            avatar_url: '',
            association_name: '',
            member_id: '',
            instagram_handle: '',
          };
          
          await supabase.from('profiles').insert([profileData]);
          await fetchProfile(data.user.id);
        }
        
        return { error: null };
      } catch (error: any) {
        return { error: error.message };
      }
    },
    async signOut() {
      sessionStorage.removeItem('demo_mode');
      localStorage.removeItem('aura_active_context');
      if (isDemo) {
        setIsDemo(false);
        setUser(null);
        setProfile(null);
        setActiveRoleState(null);
      } else {
        await supabase.auth.signOut();
      }
    },
    async refreshProfile() {
      if (user && !isDemo) await fetchProfile(user.id);
    },
    enterDemoMode(type) {
      sessionStorage.setItem('demo_mode', type);
      localStorage.setItem('aura_active_context', type);
      setIsDemo(true);
      const name = "Invité Démo";
      setUser({ id: 'demo-user-id', email: 'demo@aura.art' } as any);
      setProfile({
        id: 'demo-user-id',
        email: 'demo@aura.art',
        full_name: name,
        avatar_url: '',
        bio: 'Compte de démonstration.',
        is_artist: type === 'artist',
        is_member: type === 'member',
        is_association: type === 'association',
        association_name: type === 'association' ? 'Collectif Démo' : '',
        member_id: '',
        instagram_handle: '',
        created_at: new Date()
      });
      setActiveRoleState(type);
      setLoading(false);
    },
    switchContext,
    async activateRole(role, data) {
      if (!user || isDemo) return { error: "Non autorisé" };
      try {
        const updates: any = {
          [`is_${role}`]: true,
          updated_at: new Date()
        };
        if (role === 'association' && data?.association_name) {
          updates.association_name = data.association_name;
        }
        if (role === 'member' && data?.member_id) {
          updates.member_id = data.member_id;
        }
        
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);
          
        if (error) throw error;
        
        await fetchProfile(user.id);
        return { error: null };
      } catch (error: any) {
        return { error: error.message };
      }
    },
    async deactivateRole(role) {
      if (!user || isDemo) return { error: "Non autorisé" };
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            [`is_${role}`]: false,
            updated_at: new Date()
          })
          .eq('id', user.id);
          
        if (error) throw error;
        
        await fetchProfile(user.id);
        return { error: null };
      } catch (error: any) {
        return { error: error.message };
      }
    },
    async deleteAccount() {
      if (!user || isDemo) return { error: "Action impossible en mode démo ou non connecté." };
      try {
        // Supprimer le profil déclenche les cascades, mais ne supprime pas l'utilisateur dans auth.users
        // Pour supprimer l'utilisateur complètement, il faut appeler une edge function Supabase
        // Pour la démonstration, on supprime seulement le profil.
        const { error: profileError } = await supabase.from('profiles').delete().eq('id', user.id);
        if (profileError) throw profileError;

        await supabase.auth.signOut();
        return { error: null };
      } catch (error: any) {
        return { error: error.message };
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
