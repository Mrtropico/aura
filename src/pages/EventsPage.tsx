import { useState } from 'react';
import { Plus, MapPin, Calendar, Clock, Ticket } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

export function EventsPage() {
  const { activeRole } = useAuth();
  const [loading, setLoading] = useState(false);

  const isAsso = activeRole === 'association';

  return (
    <div className="space-y-8 animate-in fade-in slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 uppercase italic">Événements</h1>
          <p className="text-sm text-neutral-500 font-medium tracking-tight">
            {isAsso ? 'Coordination des manifestations culturelles' : 'Consultez l\'agenda culturel de l\'association'}
          </p>
        </div>
        {isAsso && (
          <button className="h-12 px-6 bg-brand-orange text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-orange/20 flex items-center gap-2 hover:scale-[1.02] transition-transform active:scale-95">
            <Plus size={16} />
            Créer un événement
          </button>
        )}
      </div>

      <div className="space-y-4">
        {[1, 2].map((i) => (
          <motion.div 
            key={i}
            whileHover={{ x: 4 }}
            className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm flex flex-col md:flex-row gap-6 items-center group"
          >
            <div className="w-full md:w-48 h-32 rounded-2xl bg-neutral-100 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/20 to-brand-rose/20 opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center text-neutral-200">
                <Calendar size={32} strokeWidth={1} />
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-brand-orange/10 text-brand-orange rounded-md">
                  Exposition
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-brand-success/10 text-brand-success rounded-md">
                  Planifié
                </span>
              </div>
              
              <h3 className="text-xl font-black tracking-tight uppercase text-brand-ink">Marché de Créateurs de Printemps {i}</h3>
              
              <div className="flex flex-wrap gap-6 text-neutral-400">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-neutral-200" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">22 Mai 2026</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-neutral-200" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">10h00 - 19h00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ticket size={14} className="text-neutral-200" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Entrée: 2.00€</span>
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
              <button className={`flex-1 md:w-32 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isAsso ? 'bg-neutral-900 text-white' : 'bg-brand-orange text-white shadow-lg shadow-brand-orange/10'
              }`}>
                {isAsso ? 'Détails' : 'Réserver'}
              </button>
              {isAsso && (
                <button className="flex-1 md:w-32 py-3 bg-neutral-100 text-neutral-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-neutral-100 hover:bg-neutral-200 transition-colors">
                  Modifier
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
