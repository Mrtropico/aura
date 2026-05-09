import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Users, Calendar, Euro } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function WorkshopsPage() {
  const { activeRole } = useAuth();
  const [loading, setLoading] = useState(false);

  const isAsso = activeRole === 'association';

  return (
    <div className="space-y-8 animate-in fade-in slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-ink uppercase italic">Ateliers</h1>
          <p className="text-sm text-neutral-500 font-medium tracking-tight">
            {isAsso ? 'Programmation et suivi des sessions collectives' : 'Découvrez et inscrivez-vous aux ateliers de l\'association'}
          </p>
        </div>
        {isAsso && (
          <button className="h-12 px-6 bg-brand-turquoise text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-turquoise/20 flex items-center gap-2 hover:scale-[1.02] transition-transform active:scale-95">
            <Plus size={16} />
            Nouvel Atelier
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -4 }}
            className="bg-white rounded-[2rem] p-6 border border-neutral-100 shadow-sm relative overflow-hidden group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-turquoise/10 flex items-center justify-center text-brand-turquoise shadow-inner">
                <Users size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-neutral-100 rounded-full text-neutral-500">
                Hebdomadaire
              </span>
            </div>

            <h3 className="text-lg font-black tracking-tight mb-2 uppercase text-brand-ink">Atelier Sculpture {i}</h3>
            <p className="text-xs text-neutral-400 font-medium leading-relaxed mb-6 line-clamp-2 italic">
              Apprentissage des techniques de modelage et de moulage pour tous niveaux, guidé par nos artistes résidents.
            </p>

            <div className="space-y-3 pt-6 border-t border-neutral-50">
              <div className="flex items-center gap-3 text-neutral-500">
                <Calendar size={14} className="text-neutral-300" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Mardi · 18h - 20h</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-500">
                <Euro size={14} className="text-neutral-300" />
                <span className="text-[10px] font-bold uppercase tracking-wider">15.00€ / 7.00€ (social)</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-500">
                <Users size={14} className="text-neutral-300" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Capacité: 12 places</span>
              </div>
            </div>

            <div className="mt-8">
              <button className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                isAsso 
                  ? 'bg-neutral-100 hover:bg-brand-turquoise hover:text-white' 
                  : 'bg-brand-turquoise text-white shadow-lg shadow-brand-turquoise/10 hover:scale-[1.02]'
              }`}>
                {isAsso ? 'Gérer les sessions' : 'Réserver une place'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
