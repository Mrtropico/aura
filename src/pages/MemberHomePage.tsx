import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Calendar, Palette, Star, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import type { Member } from '../hooks/useMembers';

export function MemberHomePage() {
  const { profile } = useAuth();
  const [memberData, setMemberData] = useState<Member | null>(null);

  useEffect(() => {
    if (profile?.member_id) {
      supabase.from('members').select('*').eq('id', profile.member_id).single().then(({ data }) => {
        if (data) {
          setMemberData(data as Member);
        }
      });
    }
  }, [profile?.member_id]);

  const joinDate = memberData?.joined_at 
    ? new Date(memberData.joined_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'En attente';

  return (
    <div className="space-y-10 animate-in fade-in slide-up">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900 uppercase italic">Bonjour, {profile?.full_name?.split(' ')[0]}</h1>
          <p className="text-sm text-neutral-500 font-medium tracking-tight mt-1">Ravi de vous revoir sur AURA</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
          <Star size={24} fill="currentColor" />
        </div>
      </div>

      {/* Membership Card - Glassmorphism */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative p-8 rounded-[2.5rem] bg-white border border-white shadow-[0_8px_32px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-brand-orange text-white rounded-full">
                {memberData?.status === 'actif' ? 'Adhérent Actif' : (memberData?.status || 'Non Lié')}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-neutral-100 text-neutral-500 rounded-full">
                Tarif Social
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight uppercase">Contribut' Or {new Date().getFullYear()}</h2>
            <div className="flex gap-8">
              <div>
                <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">Cotisation</p>
                <p className="font-bold text-neutral-900">{memberData?.membership_fee ? `${memberData.membership_fee.toFixed(2).replace('.', ',')} €` : '--'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-neutral-300 uppercase tracking-widest mb-1">Depuis le</p>
                <p className="font-bold text-neutral-900">{joinDate}</p>
              </div>
            </div>
          </div>
          
          <button className="h-14 px-8 bg-brand-ink text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl hover:bg-black transition-all">
            <CreditCard size={18} />
            Ma Carte Membre
          </button>
        </div>
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Upcoming Events */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black tracking-widest uppercase text-neutral-400">Événements à venir</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-brand-orange flex items-center gap-1">
              Tout voir <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="group bg-white p-5 rounded-3xl border border-neutral-100 shadow-sm flex items-center gap-5 hover:bg-neutral-50 transition-colors cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-brand-canvas flex flex-col items-center justify-center border border-neutral-100">
                  <span className="text-[8px] font-black uppercase text-neutral-400 leading-none">Mai</span>
                  <span className="text-lg font-black text-brand-orange leading-tight">22</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black uppercase tracking-tight mb-0.5">Marché des Créateurs</h4>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Exposition · Entrée 2€</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-brand-canvas flex items-center justify-center text-neutral-300 group-hover:bg-brand-orange group-hover:text-white transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Workshops */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black tracking-widest uppercase text-neutral-400">Ateliers de la semaine</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-brand-orange flex items-center gap-1">
              S'inscrire <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm space-y-4">
                <div className="w-10 h-10 rounded-xl bg-brand-turquoise/5 flex items-center justify-center text-brand-turquoise">
                  <Palette size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight mb-1">Peinture Intuitive</h4>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Mercredi · 14:00</p>
                </div>
                <div className="pt-4 border-t border-neutral-50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-neutral-900">15,00€</span>
                  <span className="text-[9px] font-black text-neutral-300">4 places dispos</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
