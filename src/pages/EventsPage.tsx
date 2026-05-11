import { Plus, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function EventsPage() {
  const { activeRole } = useAuth();
  const isAsso = activeRole === 'association';

  return (
    <div className="space-y-8 animate-in fade-in slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 uppercase italic">Événements</h1>
          <p className="text-sm text-neutral-500 font-medium tracking-tight">
            {isAsso
              ? 'Publiez et gérez vos événements.'
              : 'Consultez l\'agenda culturel près de chez vous.'}
          </p>
        </div>
        {isAsso && (
          <button className="self-start sm:self-auto h-12 px-6 bg-brand-orange text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-orange/20 flex items-center gap-2 hover:scale-[1.02] transition-transform active:scale-95">
            <Plus size={16} />
            Créer un événement
          </button>
        )}
      </div>

      {/* Empty state */}
      <div className="bg-white rounded-[2.5rem] border border-dashed border-neutral-200 py-24 flex flex-col items-center gap-4 text-center px-8">
        <div className="w-16 h-16 rounded-[1.5rem] bg-neutral-50 flex items-center justify-center text-neutral-300">
          <Calendar size={32} strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-black uppercase tracking-tight text-neutral-400">Aucun événement pour le moment</h3>
        <p className="text-xs text-neutral-300 font-medium max-w-xs leading-relaxed">
          Les associations pourront bientôt publier leurs événements ici.
        </p>
      </div>
    </div>
  );
}
